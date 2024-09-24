/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-28
 *  @Filename: AuthenticatedIcon.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React, { FormEvent } from 'react';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
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
import authenticateAPI, {
  forgetAuth,
  testAuthentication,
} from '@/src/actions/authenticate-api';
import { AuthContext } from '../LVMWebRoot/LVMWebRoot';

type AuthoriseModalProps = {
  opened: boolean;
  close: () => void;
  logout?: boolean;
};

function AuthoriseModal(props: AuthoriseModalProps) {
  const { opened, close, logout = false } = props;

  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const authStatus = React.useContext(AuthContext);
  const { check: checkAuth } = authStatus;

  const attemptAuth = React.useCallback(
    async (event: FormEvent<HTMLFormElement>, password: string) => {
      event.preventDefault();

      setLoading(true);
      const success = await authenticateAPI(password);
      if (!success) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      const isAuth = await testAuthentication();
      if (!isAuth) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      await checkAuth();
      setLoading(false);
      close();
    },
    [checkAuth, close]
  );

  const doLogout = React.useCallback(async () => {
    await forgetAuth();
    await checkAuth();

    setLoading(false);
    close();
  }, [close, checkAuth]);

  const loginContents = (
    <form onSubmit={(event) => attemptAuth(event, password)}>
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
        <Button type="submit" loading={loading}>
          Submit
        </Button>
      </Group>
    </form>
  );

  const logoutContents = (
    <Stack>
      <Group justify="flex-end" mt="md">
        <Button onClick={close} variant="default">
          Cancel
        </Button>
        <Button onClick={doLogout} loading={loading}>
          Log out
        </Button>
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
  const [modalOpened, { open, close }] = useDisclosure();
  const authStatus = React.useContext(AuthContext);

  return (
    <Box>
      <Tooltip
        label={authStatus.logged ? 'Authenticated' : 'Click to authenticate'}
        visibleFrom="sm"
      >
        <ActionIcon
          variant="transparent"
          size="lg"
          c={authStatus.logged ? 'white' : 'yellow.6'}
          onClick={open}
        >
          {authStatus.logged ? <IconLock /> : <IconLockOpen />}
        </ActionIcon>
      </Tooltip>
      <AuthoriseModal opened={modalOpened} close={close} logout={authStatus.logged} />
    </Box>
  );
}
