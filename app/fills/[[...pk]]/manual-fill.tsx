/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2026-01-12
 *  @Filename: manual-fill.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconAlertCircle, IconCircleX } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Flex,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import useTask from '@/src/hooks/use-task';

function WarningMessage(props: React.PropsWithChildren) {
  return (
    <Alert title="Warning" color="yellow.9" variant="light" icon={<IconAlertCircle />}>
      {props.children}
    </Alert>
  );
}

interface ManualFillTaskResponse {
  result: boolean;
  pk: number | null;
  error: string | null;
}

function ManualFillModal(props: { opened: boolean; onClose: () => void }) {
  const router = useRouter();

  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);

  const [taskRunner, isTaskRunning] = useTask<ManualFillTaskResponse>({
    taskName: 'starting ln2 fill',
    notifyErrors: true,
    showNotifications: false,
  });

  React.useEffect(() => {
    if (props.opened) {
      setPassword('');
      setError(null);
    }
  }, [props.opened]);

  const startFill = React.useCallback(() => {
    setError(null);
    setRunning(true);

    taskRunner('/spectrographs/fills/manual-fill', true, {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((result) => {
        console.log(result);
        if (!result || !result.result) {
          setError(`Failed starting manual fill: ${result?.error || 'unknown error'}`);
          return;
        }

        router.push(result && result.pk ? `/fills/${result.pk}` : '/fills');
      })
      .catch(() => {
        setError('Failed starting manual fill.');
      })
      .finally(() => {
        setRunning(false);
      });
  }, [password]);

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      withCloseButton={!isTaskRunning || running}
      closeOnClickOutside={!isTaskRunning || running}
      closeOnEscape={!isTaskRunning || running}
      size="lg"
      title="🥶 &nbsp; Trigger manual fill"
      yOffset="15dvh"
      styles={{
        title: {
          fontSize: '1.2rem',
          fontWeight: 600,
          paddingBottom: '1rem',
        },
      }}
    >
      <Stack gap="lg">
        <WarningMessage>
          Are you sure you want to trigger a manual fill? All fills in progress will be
          aborted.
        </WarningMessage>
        <Text>
          If you want to continue, introduce the manual fill password. Wait until the
          window refreshes to track the manual fill.
        </Text>
        <TextInput
          placeholder="Enter the manual fill password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isTaskRunning || running}
        />
        <Group style={{ display: error ? 'flex' : 'none' }} gap={4}>
          <ThemeIcon color="red.8" variant="outline" size="md" bd="none">
            <IconCircleX />
          </ThemeIcon>
          <Text c="red.8">{error}</Text>
        </Group>

        <Group>
          <Group style={{ display: isTaskRunning || running ? 'flex' : 'none' }}>
            <Loader type="bars" color="blue.8" size="sm" />
            <Text>Starting fill. Please wait ...</Text>
          </Group>
          <Flex style={{ flexGrow: 1 }} />
          <Button
            color="red.9"
            variant="filled"
            disabled={password.length < 8 || isTaskRunning || running}
            onClick={startFill}
          >
            Trigger manual fill
          </Button>
          <Button
            variant="outline"
            onClick={props.onClose}
            disabled={isTaskRunning || running}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function ManualFill(props: { disabled: boolean }) {
  const AuthStatus = React.useContext(AuthContext);

  const [opened, actions] = useDisclosure(false);

  return (
    <>
      <ManualFillModal opened={opened} onClose={actions.close} />
      <Button
        variant="filled"
        color="red.9"
        onClick={actions.open}
        disabled={!AuthStatus.logged || props.disabled}
      >
        Trigger manual fill
      </Button>
    </>
  );
}
