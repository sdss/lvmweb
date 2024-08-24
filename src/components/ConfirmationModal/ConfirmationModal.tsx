/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-25
 *  @Filename: ConfirmationModal.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Button, Group, Modal } from '@mantine/core';

export type ConfirmationModalProps = {
  opened: boolean;
  close: () => void;
  title: string;
  handleAction: () => void;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
};

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const message = props.message || 'Are you sure you want to perform this action?';
  return (
    <Modal
      opened={props.opened}
      onClose={props.close}
      title={props.title}
      size={props.size || 'md'}
    >
      <Box p={4}>{message}</Box>
      <Group justify="end" pt={16}>
        <Button color="blue" onClick={props.close}>
          Cancel
        </Button>
        <Button color="blue" onClick={props.handleAction}>
          Yes
        </Button>
      </Group>
    </Modal>
  );
}
