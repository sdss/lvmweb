/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2026-01-14
 *  @Filename: abort-fill.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';

export default function AbortFillButton(props: { visible: boolean }) {
  const AuthStatus = React.useContext(AuthContext);

  const [opened, { open, close }] = useDisclosure(false);

  if (!props.visible) {
    return null;
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size="lg"
        title="❌ &nbsp; Abort fill"
        styles={{
          title: {
            fontSize: '1.2rem',
            fontWeight: 600,
            paddingBottom: '1rem',
          },
        }}
      >
        <Stack gap="lg">
          <Text>
            Are you sure you want to abort the current fill? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button
              color="red.9"
              variant="filled"
              onClick={async () => {
                await fetchFromAPI('/spectrographs/fills/abort');
                close();
              }}
            >
              Abort fill
            </Button>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button
        variant="filled"
        color="blue.9"
        onClick={open}
        disabled={!AuthStatus.logged}
      >
        Abort fill
      </Button>
    </>
  );
}
