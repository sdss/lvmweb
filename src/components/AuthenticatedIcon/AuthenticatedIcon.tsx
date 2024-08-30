/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
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
import React, { FormEvent } from 'react';
import { AuthContext } from '../LVMWebRoot/LVMWebRoot';

type AuthoriseModalProps = {
  opened: boolean;
  close: () => void;
  logout?: boolean;
};

function AuthoriseModal(props: AuthoriseModalProps) {
  const { opened, close, logout = false } = props;

  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const attemptAuth = React.useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

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
    },
    [password, close]
  );

  const doLogout = React.useCallback(async () => {
    await forgetAuth();
    close();
  }, [close]);

  const loginContents = (
    <form onSubmit={attemptAuth}>
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
        <Button type="submit">Submit</Button>
      </Group>
    </form>
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
  const [modalOpened, { open, close }] = useDisclosure();
  const authStatus = React.useContext(AuthContext);

  React.useEffect(() => {
    if (!modalOpened) {
      authStatus.check();
    }
  }, [modalOpened, authStatus]);

  return (
    <Box>
      <Tooltip label={authStatus.logged ? 'Authenticated' : 'Click to authenticate'}>
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
