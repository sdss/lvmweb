/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: O2Levels.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { AlertsContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import { Divider, Group } from '@mantine/core';
import React from 'react';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import { EnclosureResponse } from './types';

export default function O2Levels(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
}) {
  const { enclosureStatus, noData } = props;

  const alerts = React.useContext(AlertsContext);

  if (!enclosureStatus) {
    return null;
  }

  const { utilities_room, spectrograph_room } = enclosureStatus.o2_status;

  return (
    <Group gap="xs">
      <APIStatusText
        defaultTooltipText="Utilities room"
        nodata={noData}
        error={alerts?.o2_room_alerts.o2_util_room}
      >
        {utilities_room.toFixed(1)}%
      </APIStatusText>
      <Divider orientation="vertical" />
      <APIStatusText
        defaultTooltipText="Spectrograph room"
        nodata={noData}
        error={alerts?.o2_room_alerts.o2_spec_room}
      >
        {spectrograph_room.toFixed(1)}%
      </APIStatusText>
    </Group>
  );
}
