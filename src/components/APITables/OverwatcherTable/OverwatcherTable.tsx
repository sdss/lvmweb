/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-19
 *  @Filename: OverwatcherTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetch-from-API';
import useAPICall from '@/src/hooks/use-api-call';
import { Box, Group, Pill, Switch } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

type OverwatcherResponse = {
  running: boolean;
  enabled: boolean;
  observing: boolean;
  calibrating: boolean;
  allow_dome_calibrations: boolean;
};

type OverwatcherPillProps = {
  value: boolean | undefined;
  nodata: boolean;
  useErrorColour?: boolean;
};

function OverwatcherPill(props: OverwatcherPillProps) {
  const { value, nodata, useErrorColour = false } = props;

  const text = value ? 'Yes' : 'No';

  let colour: string;
  if (useErrorColour && !value) {
    colour = 'red.9';
  } else {
    colour = value ? 'lime.9' : 'dark.5';
  }

  return (
    <Pill bg={colour}>
      <APIStatusText nodata={nodata}>{text}</APIStatusText>
    </Pill>
  );
}

interface EnabledGroupProps {
  route: string;
}

function EnabledGroup(props: EnabledGroupProps & OverwatcherPillProps) {
  const { route, value, nodata } = props;

  const [isOn, setOn] = React.useState(value);

  React.useEffect(() => {
    setOn(value);
  }, [value]);

  const handleEnabledChange = React.useCallback(() => {
    // Send API request to change value
    const fullRoute = isOn ? `${route}/disable` : `${route}/enable`;
    fetchFromAPI(fullRoute, undefined, { method: 'PUT' })
      .then(() => setOn((prev) => !prev))
      .catch(() => {});
  }, [isOn]);

  return (
    <Group>
      <OverwatcherPill value={value} nodata={nodata} />
      <Box style={{ flexGrow: 1 }} />
      <Switch
        size="md"
        pr={16}
        checked={isOn}
        onChange={handleEnabledChange}
        onLabel="ON"
        offLabel="OFF"
      />
    </Group>
  );
}

export default function OverwatcherTable() {
  const [data, , noData, refresh] = useAPICall<OverwatcherResponse>(
    '/overwatcher/status',
    { interval: 10000 }
  );

  const elements = [
    {
      key: 'running',
      label: 'Running',
      value: <OverwatcherPill value={data?.running} nodata={noData} useErrorColour />,
    },
    {
      key: 'enabled',
      label: 'Enabled',
      value: (
        <EnabledGroup
          route="/overwatcher/status"
          value={data?.enabled}
          nodata={noData}
        />
      ),
    },
    {
      key: 'observing',
      label: 'Observing',
      value: <OverwatcherPill value={data?.observing} nodata={noData} />,
    },
    {
      key: 'calibrating',
      label: 'Calibrating',
      value: <OverwatcherPill value={data?.calibrating} nodata={noData} />,
    },
    {
      key: 'allow_dome_calibrations',
      label: 'Allow dome calibrations',
      value: (
        <EnabledGroup
          route="/overwatcher/status/allow_dome_calibrations"
          value={data?.allow_dome_calibrations}
          nodata={noData}
        />
      ),
    },
  ];

  return (
    <APITable
      title="Overwatcher"
      elements={elements}
      noData={noData}
      icon={<IconRobot />}
      refreshData={refresh}
    />
  );
}
