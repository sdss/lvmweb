/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: Lights.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetchFromAPI';
import { ActionIcon, Box, Group, Pill, Tooltip } from '@mantine/core';
import { IconBulbOff } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import { EnclosureResponse } from './types';

function TurnLightsOffButton() {
  const handleClick = React.useCallback(() => {
    fetchFromAPI('/enclosure/lights/off/all').catch(() => {});
  }, []);

  return (
    <>
      <Tooltip label="Turn off all lamps">
        <ActionIcon size="sm" onClick={handleClick}>
          <IconBulbOff />
        </ActionIcon>
      </Tooltip>
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
    <Group gap="xs" pr={4}>
      {LightsPills}
      <Box style={{ flexGrow: 1 }} />
      <TurnLightsOffButton />
    </Group>
  );
}
