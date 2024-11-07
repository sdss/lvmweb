/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-11-05
 *  @Filename: CalLamps.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconBulbOff } from '@tabler/icons-react';
import { ActionIcon, Box, Group, Pill, rem, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import ConfirmationModal from '@/src/components/ConfirmationModal/ConfirmationModal';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import { CalLampsResponse } from './types';

const LAMP_TO_NAME: { [k: string]: string } = {
  argon: 'Ar',
  neon: 'Ne',
  ldls: 'LDLS',
  quartz: 'Qrz',
  hgne: 'HgNe',
  xenon: 'Xe',
};

const LAMP_TO_LABEL: { [k: string]: string } = {
  argon: 'Argon',
  neon: 'Neon',
  ldls: 'LDLS',
  quartz: 'Quartz',
  hgne: 'HgNe',
  xenon: 'Xenon',
};

function TurnLightsOffButton(props: { disabled: boolean; refreshData: () => void }) {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = React.useCallback(() => {
    fetchFromAPI(
      '/enclosure/nps/calib',
      {
        method: 'PUT',
        body: JSON.stringify({ nps: 'calib', outlet: 'all', state: false }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      true
    )
      .catch(() => {})
      .then(props.refreshData)
      .finally(close);
  }, [close]);

  return (
    <>
      <Tooltip
        label={
          props.disabled ? 'Authentication needed' : 'Turn off all calibration lamps'
        }
      >
        <ActionIcon size="sm" onClick={open} disabled={props.disabled}>
          <IconBulbOff />
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        size="md"
        title="Confirm lights off"
        message="Are you sure you want to turn off all calibration lamps?"
        close={close}
        handleAction={handleClick}
      />
    </>
  );
}

type CalLampsProps = {
  data?: CalLampsResponse;
  noData: boolean;
  refreshData: () => void;
};

export default function CalLamps(props: CalLampsProps) {
  const AuthStatus = React.useContext(AuthContext);

  const { data, noData, refreshData } = props;

  const onLamps = Object.entries(data || {}).filter(([_, value]) => value);

  let LampPills: React.ReactNode;
  if (noData || onLamps.length === 0) {
    LampPills = <APIStatusText nodata={noData}>All off</APIStatusText>;
  } else {
    LampPills = onLamps.map(([light, _]) => (
      <Tooltip key={light} label={LAMP_TO_LABEL[light]}>
        <Pill bg="orange.9" component="div">
          <APIStatusText nodata={noData} size="xs">
            {LAMP_TO_NAME[light]}
          </APIStatusText>
        </Pill>
      </Tooltip>
    ));
  }

  return (
    <>
      <Group gap="xs" pr={4}>
        <Group gap={2} maw={rem(200)}>
          {LampPills}
        </Group>
        <Box style={{ flexGrow: 1 }} />
        <Group gap={5}>
          <TurnLightsOffButton
            disabled={!AuthStatus.logged}
            refreshData={refreshData}
          />
        </Group>
      </Group>
    </>
  );
}
