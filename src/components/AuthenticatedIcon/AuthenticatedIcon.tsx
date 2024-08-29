/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-28
 *  @Filename: AuthenticatedIcon.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import authenticateAPI, {
  forgetAuth,
  testAuthentication,
} from '@/src/actions/authenticate-api';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import React from 'react';

type AuthoriseModalProps = {
  opened: boolean;
  close: () => void;
  logout?: boolean;
};

function AuthoriseModal(props: AuthoriseModalProps) {
  const { opened, close, logout = false } = props;

  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const attemptAuth = React.useCallback(async () => {
    const success = await authenticateAPI(password);
    if (!success) {
      setError('Authentication failed');
      return;
    }

    const isAuth = await testAuthentication();
    if (!isAuth) {
      setError('Authentication failed');
      return;
    }

    close();
  }, [password]);

  const doLogout = React.useCallback(async () => {
    await forgetAuth();
    close();
  }, []);

  const loginContents = (
    <Stack>
      <PasswordInput
        withAsterisk
        onChange={(event) => setPassword(event.currentTarget.value)}
        label="Password"
        description="Enter the password to authenticate to the API"
        placeholder=""
        error={error}
        data-autofocus
      />
      <Group justify="flex-end" mt="md">
        <Button onClick={attemptAuth}>Submit</Button>
      </Group>
    </Stack>
  );

  const logoutContents = (
    <Stack>
      <Group justify="flex-end" mt="md">
        <Button onClick={close} variant="default">
          Cancel
        </Button>
        <Button onClick={doLogout}>Log out</Button>
      </Group>
    </Stack>
  );

  return (
    <Modal
      title={logout ? 'Do you want to log out?' : 'Authenticate'}
      size="md"
      opened={opened}
      onClose={close}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      withCloseButton
    >
      {logout ? logoutContents : loginContents}
    </Modal>
  );
}

export default function AuthenticatedIcon() {
  const [isAuth, setIsAuth] = React.useState(false);
  const [trigger, setTrigger] = React.useState(1);

  const [modalOpened, { open, close }] = useDisclosure();

  React.useEffect(() => {
    testAuthentication().then((response) => setIsAuth(response));

    const intervalID = setInterval(() => {
      testAuthentication().then((response) => {
        setIsAuth(response);
      });
    }, 10000);

    return () => clearInterval(intervalID);
  }, [trigger]);

  React.useEffect(() => {
    // Very hacky way to force a quick recheck of the authentication status
    // after the modal closes.

    if (!modalOpened) {
      setTrigger((prev) => prev + 1);
    }
  }, [modalOpened]);

  return (
    <Box>
      <Tooltip label={isAuth ? 'Authenticated' : 'Click to authenticate'}>
        <ActionIcon
          variant="transparent"
          size="lg"
          c={isAuth ? 'white' : 'yellow.6'}
          onClick={open}
        >
          {isAuth ? <IconLock /> : <IconLockOpen />}
        </ActionIcon>
      </Tooltip>
      <AuthoriseModal opened={modalOpened} close={close} logout={isAuth} />
    </Box>
  );
}
