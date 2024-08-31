/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-18
 *  @Filename: TelescopesTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import APITable from '@/src/components/APITable/APITable';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import TelescopePositionPlot from '@/src/components/TelescopePositionPlot/TelescopePositionPlot';
import useAPICall from '@/src/hooks/use-api-call';
import useTask from '@/src/hooks/use-task';
import { Box, Button, Group, Pill, Tooltip } from '@mantine/core';
import { IconTelescope } from '@tabler/icons-react';
import React from 'react';

type TelescopeStatusResponse = {
  is_parked: boolean | null;
  is_connected: boolean | null;
};

type TelescopeStatusProps = {
  data: { [tel: string]: TelescopeStatusResponse } | null;
  refresh: () => void;
};

const TELESCOPES = ['sci', 'spec', 'skye', 'skyw'];

function ParkButton(props: { refresh: () => void }) {
  const authStatus = React.useContext(AuthContext);
  const [runner, parking] = useTask<boolean>({ taskName: 'park_telescopes' });

  return (
    <Tooltip label={authStatus.logged ? 'Park telescopes' : 'Authentication needed'}>
      <Button
        size="compact-xs"
        variant="light"
        disabled={!authStatus.logged || parking}
        onClick={() => runner('/telescopes/park', true).then(props.refresh)}
      >
        Park
      </Button>
    </Tooltip>
  );
}

function TelescopeParked(props: TelescopeStatusProps) {
  const { data } = props;

  let Pills = TELESCOPES.map((tel) => {
    const telData = data?.[tel];
    const parked = telData?.is_parked;

    let color: string;
    let tooltip: string;

    if (parked === null) {
      color = 'dark.5';
      tooltip = 'Unknown position';
    } else if (parked) {
      color = 'blue';
      tooltip = 'Parked';
    } else {
      return null; // No pill for unparked telescopes
    }

    return (
      <Tooltip key={tel} label={tooltip}>
        <Pill key={tel} bg={color}>
          <APIStatusText nodata={data === null} size="xs">
            {tel}
          </APIStatusText>
        </Pill>
      </Tooltip>
    );
  });

  if (Pills.filter((p) => p !== null).length === 0) {
    Pills = [<APIStatusText key="no-parked">No parked telescopes</APIStatusText>];
  }

  return (
    <Group gap="xs" pr={4}>
      {Pills}
      <Box style={{ flexGrow: 1 }} />
      <ParkButton refresh={props.refresh} />
    </Group>
  );
}

function ConnectButton(props: { refresh: () => void }) {
  const authStatus = React.useContext(AuthContext);
  const [running, setRunning] = React.useState(false);

  const { refresh } = props;

  const connect = React.useCallback(() => {
    setRunning(true);
    fetchFromAPI('/telescopes/connect', {}, true)
      .finally(() => setRunning(false))
      .finally(refresh);
  }, [refresh]);

  return (
    <Button
      size="compact-xs"
      variant="light"
      disabled={!authStatus.logged || running}
      onClick={connect}
    >
      Connect
    </Button>
  );
}

function TelescopeConnected(props: TelescopeStatusProps) {
  const { data } = props;

  const [Pills, setPills] = React.useState<React.ReactNode[]>([]);
  const [allConnected, setAllConnected] = React.useState(false);

  React.useEffect(() => {
    setAllConnected(true);
    const tmpPills: React.ReactNode[] = [];

    TELESCOPES.map((tel) => {
      const telData = data?.[tel];
      const is_connected = telData?.is_connected;

      let color: string;
      let tooltip: string;

      if (is_connected === null) {
        color = 'dark.5';
        tooltip = 'Unknown status';
        setAllConnected(false);
      } else if (is_connected) {
        color = 'blue';
        tooltip = 'Connected';
      } else {
        color = 'orange.9';
        tooltip = 'Not connected';
        setAllConnected(false);
      }

      tmpPills.push(
        <Tooltip key={tel} label={tooltip}>
          <Pill key={tel} bg={color}>
            <APIStatusText nodata={data === null} size="xs">
              {tel}
            </APIStatusText>
          </Pill>
        </Tooltip>
      );
    });

    setPills(tmpPills);
  }, [data]);

  return (
    <Group gap="xs" pr={4}>
      {Pills}
      <Box style={{ flexGrow: 1 }} />
      {!allConnected && <ConnectButton refresh={props.refresh} />}
    </Group>
  );
}
export default function TelescopesTable() {
  const [data, , noData, refresh] = useAPICall<{
    [tel: string]: TelescopeStatusResponse;
  }>('/telescopes/status', { interval: 30000 });

  const elements = [
    {
      key: 'parked',
      label: 'Parked',
      value: <TelescopeParked data={noData ? null : data} refresh={refresh} />,
    },
    {
      key: 'connected',
      label: 'Connected',
      value: <TelescopeConnected data={noData ? null : data} refresh={refresh} />,
    },
    {
      key: 'position',
      label: undefined,
      value: <TelescopePositionPlot size="small" />,
    },
  ];

  return (
    <APITable
      title="Telescopes"
      elements={elements}
      icon={<IconTelescope />}
      noData={noData}
      refreshData={refresh}
    />
  );
}
