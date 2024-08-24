/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: DoorStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { Pill } from '@mantine/core';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import { EnclosureResponse } from './types';

export default function DoorStatus(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
}) {
  const { enclosureStatus, noData } = props;

  if (!enclosureStatus) {
    return null;
  }

  const { labels } = enclosureStatus.safety_status;

  if (labels.includes('DOOR_OPEN')) {
    return (
      <Pill key="door_open" bg="red.8">
        <APIStatusText nodata={noData} size="xs">
          Door open
        </APIStatusText>
      </Pill>
    );
  }

  if (labels.includes('DOOR_CLOSED') && !labels.includes('DOOR_LOCKED')) {
    return (
      <Pill key="door_unlocked" bg="yellow.8">
        <APIStatusText size="xs" nodata={noData}>
          Door unlocked
        </APIStatusText>
      </Pill>
    );
  }

  return <APIStatusText nodata={noData}>Closed and locked</APIStatusText>;
}
