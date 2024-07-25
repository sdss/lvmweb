/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-23
 *  @Filename: ShutdownActionIcon.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import useTask from '@/src/hooks/use-task';
import { ActionIcon, Loader, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSquareX } from '@tabler/icons-react';
import React from 'react';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

export default function ShutdownActionIcon() {
  const [isOpen, { open, close }] = useDisclosure(false);
  const [runner, isRunning] = useTask({ taskName: 'shutdown', notifyErrors: false });

  const shutDown = React.useCallback(() => {
    close();
    runner('/macros/shutdown/').catch(() => {});
  }, []);

  const label = isRunning ? 'Emergency shutdown in progress' : 'Emergency shutdown';

  return (
    <>
      <Tooltip label={label} position="bottom">
        <ActionIcon size="lg" color="red.9" onClick={open} disabled={isRunning}>
          {isRunning ? (
            <Loader type="bars" size="xs" color="gray.2" />
          ) : (
            <IconSquareX />
          )}
        </ActionIcon>
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
