/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: Lights.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetch-from-API';
import { ActionIcon, Box, Group, Pill, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBulbOff } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import { EnclosureResponse } from './types';

function TurnLightsOffButton() {
  const [opened, { open, close }] = useDisclosure();

  const handleClick = React.useCallback(() => {
    close();
    fetchFromAPI('/enclosure/lights/off/all').catch(() => {});
  }, []);

  return (
    <>
      <Tooltip label="Turn off all lamps">
        <ActionIcon size="sm" onClick={open}>
          <IconBulbOff />
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        size="md"
        title="Confirm lights off"
        // eslint-disable-next-line max-len
        message={
          'Are you sure you want to turn off all lights? ' +
          'Please confirm that nobody is currently inside the enclosure.'
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

  if (!enclosureStatus) {
    return null;
  }

  const lights = enclosureStatus.lights_status.labels.filter((light) => light);

  let LightsPills: React.ReactNode;
  if (lights.length === 0) {
    LightsPills = <APIStatusText nodata={noData}>All off</APIStatusText>;
  } else {
    LightsPills = lights.map((light) => (
      <Pill key={light} bg="orange.9">
        <APIStatusText nodata={noData} size="xs">
          {light.toLocaleLowerCase().replace('_', ' ')}
        </APIStatusText>
      </Pill>
    ));
  }

  return (
    <>
      <Group gap="xs" pr={4}>
        {LightsPills}
        <Box style={{ flexGrow: 1 }} />
        <TurnLightsOffButton />
      </Group>
    </>
  );
}
