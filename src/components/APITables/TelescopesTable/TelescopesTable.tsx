/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-18
 *  @Filename: TelescopesTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

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
};

type TelescopeParkedProps = {
  data: { [tel: string]: TelescopeStatusResponse } | null;
};

const TELESCOPES = ['sci', 'spec', 'skye', 'skyw'];

function ParkButton() {
  const authStatus = React.useContext(AuthContext);
  const [runner, parking] = useTask<boolean>({ taskName: 'park_telescopes' });

  return (
    <Tooltip label={authStatus.logged ? 'Park telescopes' : 'Authentication needed'}>
      <Button
        size="compact-xs"
        variant="light"
        disabled={!authStatus.logged || parking}
        onClick={() => runner('/telescopes/park', true)}
      >
        Go to Park
      </Button>
    </Tooltip>
  );
}

function TelescopeParked(props: TelescopeParkedProps) {
  const { data } = props;

  const Pills = TELESCOPES.map((tel) => {
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
      color = 'yellow.9';
      tooltip = 'Not parked';
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

  return (
    <Group gap="xs" pr={4}>
      {Pills}
      <Box style={{ flexGrow: 1 }} />
      <ParkButton />
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
      value: <TelescopeParked data={noData ? null : data} />,
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
