/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: Lights.tsx
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
import { EnclosureResponse } from './types';

function TurnLightsOffButton(props: { disabled: boolean }) {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = React.useCallback(() => {
    close();
    fetchFromAPI('/enclosure/lights/off/all', {}, true).catch(() => {});
  }, [close]);

  return (
    <>
      <Tooltip label={props.disabled ? 'Authentication needed' : 'Turn off all lamps'}>
        <ActionIcon size="sm" onClick={open} disabled={props.disabled}>
          <IconBulbOff />
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        size="md"
        title="Confirm lights off"
        message={
          'Are you sure you want to turn off all lights? Please confirm that ' +
          'nobody is currently inside the enclosure.'
        }
        close={close}
        handleAction={handleClick}
      />
    </>
  );
}

export default function Lights(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
}) {
  const { enclosureStatus, noData } = props;

  const AuthStatus = React.useContext(AuthContext);

  if (!enclosureStatus) {
    return null;
  }

  const lights = enclosureStatus.lights_status.labels.filter((light) => light);

  let LightsPills: React.ReactNode;
  if (lights.length === 0) {
    LightsPills = <APIStatusText nodata={noData}>All off</APIStatusText>;
  } else {
    LightsPills = lights.map((light) => (
      <Pill key={light} bg="orange.9" component="div">
        <APIStatusText nodata={noData} size="xs">
          {light.toLocaleLowerCase().replace('_', ' ')}
        </APIStatusText>
      </Pill>
    ));
  }

  return (
    <>
      <Group gap="xs" pr={4}>
        <Group gap="xs" maw={rem(200)}>
          <Box>{LightsPills}</Box>
        </Group>
        <Box style={{ flexGrow: 1 }} />
        <TurnLightsOffButton disabled={!AuthStatus.logged} />
      </Group>
    </>
  );
}
