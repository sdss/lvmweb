/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: DomeStatus.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconHandStop,
} from '@tabler/icons-react';
import { ActionIcon, Box, Group, Pill, Progress, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import ConfirmationModal from '@/src/components/ConfirmationModal/ConfirmationModal';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import useTask from '@/src/hooks/use-task';

function DomeIcon(props: {
  icon: React.ReactNode;
  tooltip: string;
  route: string;
  color?: string;
  disabled?: boolean;
  taskName?: string;
  task?: boolean;
  setDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
  refreshData?: () => void;
}) {
  const {
    icon,
    tooltip,
    route,
    color = 'blue',
    disabled = false,
    setDisabled,
    taskName = 'undefined',
    task = false,
    refreshData,
  } = props;

  const [opened, { open, close }] = useDisclosure();
  const [runner, isRunning] = useTask({ taskName, notifyErrors: false });

  const handleAction = React.useCallback(async () => {
    close();

    if (task) {
      const result = runner(route, true);
      setDisabled && setDisabled(isRunning);
      result.catch(() => {}).finally(refreshData);
    } else {
      fetchFromAPI(route, {}, true)
        .catch(() => {})
        .then(() => {
          refreshData && refreshData();
        })
        .finally(() => {
          setDisabled && setDisabled(false);
        });
    }
  }, [route, close, isRunning, runner, setDisabled, task]);

  return (
    <>
      <Tooltip label={!disabled || isRunning ? tooltip : 'Authentication needed'}>
        <ActionIcon size="sm" color={color} onClick={open} disabled={disabled}>
          {icon}
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        close={close}
        title={tooltip}
        handleAction={handleAction}
        message={`Are you sure you want to ${tooltip.toLowerCase()}?`}
      />
    </>
  );
}

function DomeIcons(props: { moving?: boolean; refreshData: () => void }) {
  const [disabled, setDisabled] = React.useState(false);

  const authStatus = React.useContext(AuthContext);
  const notAuthed = !authStatus.logged;

  return (
    <>
      <Group gap={5}>
        <DomeIcon
          icon={<IconArrowsMaximize size={18} />}
          tooltip="Open the dome"
          route="/enclosure/open/"
          disabled={props.moving || disabled || notAuthed}
          setDisabled={setDisabled}
          refreshData={props.refreshData}
          taskName="open dome"
          task
        />
        <DomeIcon
          icon={<IconArrowsMinimize size={18} />}
          tooltip="Close the dome"
          route="/enclosure/close/"
          disabled={props.moving || disabled || notAuthed}
          setDisabled={setDisabled}
          refreshData={props.refreshData}
          taskName="close dome"
          task
        />
        <DomeIcon
          icon={<IconHandStop size={18} />}
          tooltip="Stop the dome"
          route="/enclosure/stop/"
          color="red.9"
          disabled={notAuthed}
          refreshData={props.refreshData}
        />
      </Group>
    </>
  );
}

type DomeStatusProps = {
  domeLabels: string[] | undefined;
  noData: boolean;
  refreshData: () => void;
};

export default function DomeStatus(props: DomeStatusProps) {
  const { domeLabels, noData, refreshData } = props;

  if (!domeLabels || domeLabels.length === 0) {
    return null;
  }

  let DividerElement = <Box style={{ flexGrow: 1 }} />;
  let label: string;

  if (domeLabels.includes('OPEN')) {
    label = 'Open';
  } else if (domeLabels.includes('CLOSED')) {
    label = 'Closed';
  } else if (domeLabels.includes('MOVING')) {
    if (domeLabels.includes('MOTOR_OPENING')) {
      label = 'Opening';
    } else if (domeLabels.includes('MOTOR_CLOSING')) {
      label = 'Closing';
    } else {
      label = 'Moving';
    }
    DividerElement = <Progress h={10} value={100} style={{ flexGrow: 1 }} animated />;
  } else {
    label = 'Unknown';
  }

  return (
    <Group pr={4}>
      <Pill bg={domeLabels.includes('CLOSED') ? 'lime.9' : 'orange.9'}>
        <APIStatusText size="xs" nodata={noData}>
          {label}
        </APIStatusText>
      </Pill>
      {DividerElement}
      <DomeIcons moving={label === 'Moving'} refreshData={refreshData} />
    </Group>
  );
}
