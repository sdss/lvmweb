/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: SpecTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconPrismLight } from '@tabler/icons-react';
import { Divider, Group, Pill, Progress, Stack, Text, Tooltip } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { AlertsContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import useAPICall from '@/src/hooks/use-api-call';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

const LN2_THRESHOLD = -160;
const CCD_THRESHOLD = -85;

type Specs = 'sp1' | 'sp2' | 'sp3';
type Cameras = 'b1' | 'b2' | 'b3' | 'r1' | 'r2' | 'r3' | 'z1' | 'z2' | 'z3';
type StatusType = 'idle' | 'reading' | 'exposing' | 'unknown' | 'error';
type Sensor = 'ccd' | 'ln2';

type SpecStatusResponse = {
  status: { [key in Specs]: StatusType };
  last_exposure_no: number;
  total_exposure_time: number | null;
  exposure_etr: number | null;
};

type SpecTempsResponse = {
  date: string;
  camera: Cameras;
  sensor: Sensor;
  temperature: number;
}[];

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
    [specs, nodata, threshold]
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

type SpecProgressProps = {
  state: SpecStatusResponse | null;
  noData: boolean;
};

function SpecProgress(props: SpecProgressProps) {
  const [etr, setETR] = React.useState<number | null>(null);
  const [totalTime, setTotalTime] = React.useState<number | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [reading, setReading] = React.useState<boolean>(false);

  const { state, noData } = props;

  const exposingSpecs = React.useMemo(() => {
    if (!state) {
      return [];
    }

    return Object.keys(state.status).filter(
      (spec) => state.status[spec as Specs] === 'exposing'
    );
  }, [state]);

  React.useEffect(() => {
    if (noData || !state) {
      setProgress(null);
      return;
    }

    if (state.exposure_etr === null || state.total_exposure_time === null) {
      setProgress(null);
      return;
    }

    if (state.exposure_etr === 0) {
      setProgress(100);
      return;
    }

    setReading(exposingSpecs.length === 0);
    setETR(state.exposure_etr);
    setTotalTime(state.total_exposure_time);
    setProgress((1 - state.exposure_etr / state.total_exposure_time) * 100);
  }, [state, noData]);

  React.useEffect(() => {
    if (etr === null || totalTime === null) {
      return () => {};
    }

    const interval = totalTime > 300 ? 1 : 0.1;
    const rate = 100 / totalTime;

    const intervalID = setInterval(() => {
      setETR((prevETR) => (prevETR === null ? prevETR : prevETR - interval));
      setProgress((prevProgress) => {
        if (prevProgress === null) {
          return prevProgress;
        }

        return prevProgress + interval * rate;
      });
    }, interval * 1000);

    return () => clearInterval(intervalID);
  }, [etr, totalTime]);

  const exposureState = reading ? 'Reading' : 'Exposing';

  return progress ? (
    <Tooltip label={`${exposureState} - ETR: ${etr?.toFixed(0)} / ${totalTime} s`}>
      <Progress
        h={10}
        value={progress}
        style={{ flexGrow: 1 }}
        color={reading ? 'lime.9' : 'blue'}
        animated={progress >= 100}
      />
    </Tooltip>
  ) : (
    <APIStatusText nodata={noData}>No exposure in progress</APIStatusText>
  );
}

type SpecStatusProps = SpecProgressProps;

function SpecStatus(props: SpecStatusProps) {
  const { state, noData } = props;

  const exposingSpecs = React.useMemo(() => {
    if (!state) {
      return [];
    }

    return Object.keys(state.status).filter(
      (spec) => state.status[spec as Specs] === 'exposing'
    );
  }, [state]);

  const readingSpecs = React.useMemo(() => {
    if (!state) {
      return [];
    }

    return Object.keys(state.status).filter(
      (spec) => state.status[spec as Specs] === 'reading'
    );
  }, [state]);

  const Pills = ['sp1', 'sp2', 'sp3'].map((spec) => {
    if (!exposingSpecs.includes(spec) && !readingSpecs.includes(spec)) {
      return null;
    }

    return (
      <Tooltip
        key={spec}
        label={exposingSpecs.includes(spec) ? `Exposing ${spec}` : `Reading ${spec}`}
      >
        <Pill bg={exposingSpecs.includes(spec) ? 'blue' : 'lime.9'}>
          <APIStatusText nodata={noData}>{spec}</APIStatusText>
        </Pill>
      </Tooltip>
    );
  });

  if (Pills.filter((spec) => spec !== null).length === 0) {
    return <APIStatusText nodata={noData}>All spectrographs are idle</APIStatusText>;
  }

  return <Group gap="xs">{Pills}</Group>;
}

function LN2Status(props: { filling: boolean | null; noData: boolean }) {
  // The LN2 fill status is a different call and when the panel is first
  // rendered, the filling status is not available. So for a second the status
  // appears in red as "Unknown". We add a debounce to give some time to the API
  // call to return the correct status.
  const [color, setColor] = useDebouncedState('blue', 1000);
  const [text, setText] = useDebouncedState('Not filling', 1000);

  React.useEffect(() => {
    if (props.filling === null || props.noData) {
      setColor('red.8');
      setText('Unknown');
    } else if (props.filling) {
      setColor('orange.9');
      setText('Filling');
    } else {
      setColor('blue');
      setText('Not filling');
    }
  }, [props.filling, props.noData]);

  return (
    <Pill bg={color}>
      <APIStatusText size="sm">{text}</APIStatusText>
    </Pill>
  );
}

export default function SpecTable() {
  const STATUS_INTERVAL = 5000;
  const TEMPS_INTERVAL = 60000;
  const FILLING_INTERVAL = 3000;

  const alerts = React.useContext(AlertsContext);

  const [specState, , noDataSpec, refreshSpec] = useAPICall<SpecStatusResponse>(
    '/spectrographs/status',
    { interval: STATUS_INTERVAL }
  );

  const [specTemps, , noDataTemps, refreshTemps] = useAPICall<SpecTempsResponse>(
    '/spectrographs/temperatures?start=-1m&last=true',
    { interval: TEMPS_INTERVAL }
  );

  const [filling, , noDataFilling] = useAPICall<boolean>(
    '/spectrographs/fills/running',
    { interval: FILLING_INTERVAL }
  );

  const noData = noDataSpec || noDataTemps;

  const refresh = React.useCallback(() => {
    refreshSpec();
    refreshTemps();
  }, [refreshSpec, refreshTemps]);

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
      key: 'progress',
      label: 'Exposure progress',
      value: <SpecProgress state={specState} noData={noDataSpec} />,
    },
    {
      key: 'status',
      label: 'Status',
      value: <SpecStatus state={specState} noData={noDataSpec} />,
    },
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
      key: 'ln2_status',
      label: 'LN\u2082 Status',
      value: <LN2Status filling={filling} noData={noDataFilling} />,
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
