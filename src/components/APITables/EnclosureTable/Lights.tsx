/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: Lights.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconBulb, IconBulbOff } from '@tabler/icons-react';
import { ActionIcon, Box, Group, Pill, rem, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import ConfirmationModal from '@/src/components/ConfirmationModal/ConfirmationModal';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import { EnclosureResponse } from './types';

function TurnTelescopeRedButton(props: {
  disabled: boolean;
  on: boolean;
  refreshData: () => void;
}) {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = React.useCallback(() => {
    const route = props.on
      ? '/enclosure/lights/off/telescope_red'
      : '/enclosure/lights/on/telescope_red';

    fetchFromAPI(route, {}, true)
      .catch(() => {})
      .then(props.refreshData)
      .finally(close);
  }, [close]);

  return (
    <>
      <Tooltip
        label={
          props.disabled
            ? 'Authentication needed'
            : 'Turn on/off the telescope red lamps'
        }
      >
        <ActionIcon size="sm" onClick={open} disabled={props.disabled}>
          <IconBulb style={{ color: 'var(--mantine-color-red-6)' }} />
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        size="md"
        title="Confirm lights on/off"
        message={
          'Are you sure you want to turn on/off the telescope red lights? ' +
          'Turning the lights on can affect other telescopes if the dome is open.'
        }
        close={close}
        handleAction={handleClick}
      />
    </>
  );
}

function TurnLightsOffButton(props: { disabled: boolean; refreshData: () => void }) {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = React.useCallback(() => {
    fetchFromAPI('/enclosure/lights/off/all', {}, true)
      .catch(() => {})
      .then(props.refreshData)
      .finally(close);
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
  refreshData: () => void;
}) {
  const { enclosureStatus, noData, refreshData } = props;

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
        <Group gap={2} maw={rem(200)}>
          {LightsPills}
        </Group>
        <Box style={{ flexGrow: 1 }} />
        <Group gap={5}>
          <TurnTelescopeRedButton
            disabled={!AuthStatus.logged}
            on={lights.includes('TELESCOPE_RED')}
            refreshData={refreshData}
          />
          <TurnLightsOffButton
            disabled={!AuthStatus.logged}
            refreshData={refreshData}
          />
        </Group>
      </Group>
    </>
  );
}
