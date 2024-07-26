/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: SpecTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { AlertsContext } from '@/app/overview/page';
import useAPICall from '@/src/hooks/use-api-call';
import { Divider, Group, Pill, Stack, Text } from '@mantine/core';
import { IconPrismLight } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

const LN2_THRESHOLD = -170;
const CCD_THRESHOLD = -85;

type Specs = 'sp1' | 'sp2' | 'sp3';
type Cameras = 'b1' | 'b2' | 'b3' | 'r1' | 'r2' | 'r3' | 'z1' | 'z2' | 'z3';
type StatusType = 'idle' | 'reading' | 'exposing' | 'unknown' | 'error';
type Sensor = 'ccd' | 'ln2';

type SpecStatusResponse = {
  status: { [key in Specs]: StatusType };
  last_exposure_no: number;
};

type SpecTempsResponse = {
  date: string;
  camera: Cameras;
  sensor: Sensor;
  temperature: number;
}[];

function SpecStatusPills(specs: string[], nodata: boolean) {
  return (
    <Group gap="xs">
      {specs.map((spec) => (
        <Pill key={spec} bg="dark.5">
          <APIStatusText nodata={nodata}>{spec}</APIStatusText>
        </Pill>
      ))}
    </Group>
  );
}

function SpecTemperatures(
  specs: { [k in Cameras]?: number },
  nodata: boolean,
  threshold: number = 0
) {
  const getRow = React.useCallback(
    (camera: Cameras, idx: number) => {
      const temp = specs[camera];
      const error = temp !== undefined && temp >= threshold;
      return (
        <React.Fragment key={camera}>
          <APIStatusText
            size="xs"
            nodata={nodata}
            error={error}
            errorTooltipText="Temperature exceeds threshold"
            defaultTooltipText={camera}
          >
            {temp?.toFixed(1).padStart(6, '\xa0') || '?'}
          </APIStatusText>
          {idx !== 2 && <Divider orientation="vertical" />}
        </React.Fragment>
      );
    },
    [specs, nodata]
  );

  return (
    <Stack gap={2}>
      <Group gap="xs" key="sp1">
        <>
          <Text size="xs" ff="monospace">
            sp1:{' '}
          </Text>
          {['b1', 'r1', 'z1'].map((camera, idx) => getRow(camera as Cameras, idx))}
        </>
      </Group>
      <Group gap="xs" key="sp2">
        <>
          <Text size="xs" ff="monospace">
            sp2:{' '}
          </Text>
          {['b2', 'r2', 'z2'].map((camera, idx) => getRow(camera as Cameras, idx))}
        </>
      </Group>
      <Group gap="xs" key="sp3">
        <>
          <Text size="xs" ff="monospace">
            sp3:{' '}
          </Text>
          {['b3', 'r3', 'z3'].map((camera, idx) => getRow(camera as Cameras, idx))}
        </>
      </Group>
    </Stack>
  );
}

function getAlertPills(alerts: string[], nodata: boolean = false) {
  if (alerts.length === 0) {
    return <APIStatusText nodata={nodata}>No alerts</APIStatusText>;
  }

  return (
    <Group gap="xs">
      {alerts.sort().map((alert) => (
        <Pill key={alert} bg="red.8">
          <APIStatusText>{alert}</APIStatusText>
        </Pill>
      ))}
    </Group>
  );
}
export default function SpecTable() {
  const INTERVAL = 30000;

  const alerts = React.useContext(AlertsContext);

  const [specState, , noDataSpec, refreshSpec] = useAPICall<SpecStatusResponse>(
    '/spectrographs/status',
    { interval: INTERVAL }
  );

  const [specTemps, , noDataTemps, refreshTemps] = useAPICall<SpecTempsResponse>(
    '/spectrographs/temperatures?start=-1m&last=true',
    { interval: INTERVAL }
  );

  const noData = noDataSpec || noDataTemps;

  const refresh = React.useCallback(() => {
    refreshSpec();
    refreshTemps();
  }, [refreshSpec, refreshTemps]);

  const exposingSpecs = React.useMemo(() => {
    if (!specState) {
      return [];
    }

    return Object.keys(specState.status).filter(
      (spec) => specState.status[spec as Specs] === 'exposing'
    );
  }, [specState]);

  const readingSpecs = React.useMemo(() => {
    if (!specState) {
      return [];
    }

    return Object.keys(specState.status).filter(
      (spec) => specState.status[spec as Specs] === 'reading'
    );
  }, [specState]);

  const getTemperatures = React.useCallback(
    (sens: Sensor) => {
      if (!specTemps) {
        return {};
      }

      const sensorData = specTemps.filter(({ sensor }) => sens === sensor);

      const temps: { [k in Cameras]?: number } = {};
      sensorData.forEach(({ camera, temperature }) => {
        temps[camera as Cameras] = temperature;
      });

      return temps;
    },
    [specTemps]
  );

  const ExposingPills =
    exposingSpecs.length > 0 ? (
      SpecStatusPills(exposingSpecs, noData)
    ) : (
      <APIStatusText nodata={noData}>No cameras are exposing</APIStatusText>
    );

  const ReadingPills =
    readingSpecs.length > 0 ? (
      SpecStatusPills(readingSpecs, noData)
    ) : (
      <APIStatusText nodata={noData}>No cameras are reading</APIStatusText>
    );

  const ccdTemperatures = getTemperatures('ccd');
  const ln2Temperatures = getTemperatures('ln2');

  const CCDTemperatures = SpecTemperatures(ccdTemperatures, noData, CCD_THRESHOLD);
  const LN2Temperatures = SpecTemperatures(ln2Temperatures, noData, LN2_THRESHOLD);

  const tempAlerts: Cameras[] = [];
  const o2Alerts: string[] = [];
  if (alerts) {
    const cameraAlerts = alerts.camera_active_alerts.map(
      (alert) => alert.split('_')[0] as Cameras
    );
    tempAlerts.push(...Array.from(new Set(cameraAlerts)));

    if (alerts.o2_active_alerts.includes('o2_util_room')) {
      o2Alerts.push('utilities');
    }

    if (alerts.o2_active_alerts.includes('o2_spec_room')) {
      o2Alerts.push('spectrographs');
    }
  }

  const elements = [
    {
      key: 'temperature_alerts',
      label: 'Temperature Alerts',
      value: getAlertPills(tempAlerts, noData),
    },
    {
      key: 'o2_alerts',
      label: 'O\u2082 Alerts',
      value: getAlertPills(o2Alerts, noData),
    },
    {
      key: 'exposing',
      label: 'Exposing',
      value: specState ? ExposingPills : undefined,
    },
    { key: 'reading', label: 'Reading', value: specState ? ReadingPills : undefined },
    {
      key: 'ccd_temperatures',
      label: 'CCD Temperatures',
      value: specTemps ? CCDTemperatures : undefined,
    },
    {
      key: 'ln2_temperatures',
      label: 'LN\u2082 Temperatures',
      value: specTemps ? LN2Temperatures : undefined,
    },
    {
      key: 'last_exposure_no',
      label: 'Last Exposure',
      value: specState?.last_exposure_no,
    },
  ];
  return (
    <APITable
      title="Spectrographs"
      elements={elements}
      noData={noData}
      icon={<IconPrismLight />}
      refreshData={refresh}
    />
  );
}
