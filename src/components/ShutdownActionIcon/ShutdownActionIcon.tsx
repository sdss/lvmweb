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
import { isLCO } from '@/src/actions/get-ip';
import useTask from '@/src/hooks/use-task';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { AuthContext } from '../LVMWebRoot/LVMWebRoot';
import classes from './ShutdownActionIcon.module.css';

export default function ShutdownActionIcon() {
  const [isOpen, { open, close }] = useDisclosure(false);
  const [runner, isRunning] = useTask({ taskName: 'shutdown', notifyErrors: false });

  const [atLCO, setAtLCO] = React.useState(false);
  const authStatus = React.useContext(AuthContext);

  React.useEffect(() => {
    isLCO()
      .then((value) => setAtLCO(value))
      .catch(() => setAtLCO(false));
  }, []);

  const shutDown = React.useCallback(async () => {
    close();

    const lcoOverride = process.env.LCO_OVERRIDE_CODE;

    if (!authStatus.logged && atLCO && lcoOverride !== undefined) {
      runner(
        `/macros/shutdownLCO?override_code=${lcoOverride}&disable_overwatcher=1`,
        true
      ).catch(() => {});
    } else {
      runner('/macros/shutdown?disable_overwatcher=1', true).catch(() => {});
    }
  }, [close, runner, atLCO, authStatus.logged]);

  const label = isRunning ? 'Emergency shutdown in progress' : 'Emergency shutdown';
  const disabled = isRunning || (!atLCO && !authStatus.logged);

  return (
    <>
      <Tooltip label={label} position="bottom" visibleFrom="sm">
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
            disabled={disabled}
            style={{
              backgroundColor: disabled ? 'transparent' : 'unset',
            }}
            variant="transparent"
          >
            {isRunning ? (
              <Loader type="bars" size="xs" color="gray.2" />
            ) : (
              <IconArrowBarLeft />
            )}
          </ActionIcon>
          <Text size="sm" c={disabled ? 'dimmed' : 'gray.2'} visibleFrom="sm">
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
