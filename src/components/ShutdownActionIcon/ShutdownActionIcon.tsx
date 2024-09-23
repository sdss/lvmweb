/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-23
 *  @Filename: ShutdownActionIcon.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconArrowBarLeft } from '@tabler/icons-react';
import { ActionIcon, Group, Loader, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useTask from '@/src/hooks/use-task';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import classes from './ShutdownActionIcon.module.css';

export default function ShutdownActionIcon() {
  const [isOpen, { open, close }] = useDisclosure(false);
  const [runner, isRunning] = useTask({ taskName: 'shutdown', notifyErrors: false });

  const shutDown = React.useCallback(() => {
    close();
    runner('/macros/shutdown/').catch(() => {});
  }, [close, runner]);

  const label = isRunning ? 'Emergency shutdown in progress' : 'Emergency shutdown';

  return (
    <>
      <Tooltip label={label} position="bottom">
        <Group
          gap={0}
          onClick={open}
          style={{ cursor: 'pointer' }}
          className={classes.icon}
        >
          <ActionIcon
            size="lg"
            color="white"
            classNames={{ icon: classes.icon }}
            onClick={open}
            disabled={isRunning}
            variant="transparent"
          >
            {isRunning ? (
              <Loader type="bars" size="xs" color="gray.2" />
            ) : (
              <IconArrowBarLeft />
            )}
          </ActionIcon>
          <Text size="sm" c="gray.2">
            Shutdown
          </Text>
        </Group>
      </Tooltip>
      <ConfirmationModal
        opened={isOpen}
        close={close}
        title="Emergency shutdown"
        handleAction={shutDown}
        message="Are you sure you want to perform an emergency shutdown?"
      />
    </>
  );
}
