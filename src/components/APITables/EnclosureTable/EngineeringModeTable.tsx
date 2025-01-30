/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: EngineeringModeTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconAlertHexagonOff } from '@tabler/icons-react';
import { ActionIcon, Box, Group, Pill, rem, Tooltip } from '@mantine/core';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import { EnclosureResponse } from './types';

export default function EngineeringModeTable(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
  refreshData: () => void;
}) {
  const { enclosureStatus, noData, refreshData } = props;
  const authStatus = React.useContext(AuthContext);

  const [pills, setPills] = React.useState<React.ReactNode[]>([]);
  const [isInEMode, setIsInEMode] = React.useState(false);
  const [disableEModeRunning, setDisableEModeRunning] = React.useState(false);

  React.useEffect(() => {
    if (!enclosureStatus?.engineering_mode) {
      return;
    }

    const emode = enclosureStatus?.engineering_mode;
    const tmpPills: React.ReactNode[] = [];

    if (emode.enabled) {
      tmpPills.push(
        <Pill key="eng-mode" bg="red.8">
          <APIStatusText nodata={noData} size="xs">
            Engineering mode
          </APIStatusText>
        </Pill>
      );
    }

    if (emode.plc_hardware_bypass_mode !== 'none') {
      let hwBypassText = 'Hardware bypass (local)';
      if (emode.plc_hardware_bypass_mode === 'remote') {
        hwBypassText = hwBypassText.replace('local', 'remote');
      }
      tmpPills.push(
        <Pill key="remote" bg="red.8">
          <APIStatusText nodata={noData} size="xs">
            {hwBypassText}
          </APIStatusText>
        </Pill>
      );
    }

    if (emode.plc_software_bypass_mode !== 'none') {
      let hwBypassText = 'Software bypass (local)';
      if (emode.plc_software_bypass_mode === 'remote') {
        hwBypassText = hwBypassText.replace('local', 'remote');
      }
      tmpPills.push(
        <Pill key="remote" bg="red.8">
          <APIStatusText nodata={noData} size="xs">
            {hwBypassText}
          </APIStatusText>
        </Pill>
      );
    }

    if (tmpPills.length === 0) {
      tmpPills.push(
        <Pill key="eng-mode" bg="blue.9">
          <APIStatusText nodata={noData} size="xs">
            No overrides
          </APIStatusText>
        </Pill>
      );
      setIsInEMode(false);
    } else {
      setIsInEMode(true);
    }

    setPills(tmpPills);
  }, [enclosureStatus?.engineering_mode]);

  const disableEMode = React.useCallback(() => {
    if (!isInEMode) {
      return;
    }

    setDisableEModeRunning(true);
    fetchFromAPI('/enclosure/engineering-mode/disable', { method: 'GET' }, true)
      .then(refreshData)
      .catch(() => {})
      .finally(() => setDisableEModeRunning(false));
  }, [isInEMode, refreshData]);

  return (
    <>
      <Group gap="xs" pr={4}>
        <Group gap={2} maw={rem(200)}>
          {pills.map((pill) => pill)}
        </Group>
        <Box style={{ flexGrow: 1 }} />
        <Group gap={5} style={{ alignSelf: 'baseline' }}>
          <Tooltip
            label={
              authStatus.logged ? 'Disable engineering mode' : 'Authentication needed'
            }
          >
            <ActionIcon
              size="sm"
              onClick={disableEMode}
              loading={disableEModeRunning}
              disabled={!authStatus.logged}
            >
              <IconAlertHexagonOff size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </>
  );
}
