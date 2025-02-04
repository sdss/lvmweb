/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2025-02-03
 *  @Filename: heartbeat.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { Modal, Text } from '@mantine/core';
import useAPICall from '@/src/hooks/use-api-call';

export default function LVMWebHeartbeat() {
  const [nFailures, setNFailures] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);

  const checkHeartbeat = React.useCallback((data: { result: boolean }) => {
    if (!data || !data.result) {
      setNFailures((prev) => prev + 1);
    } else {
      setNFailures(0);
    }
  }, []);

  React.useEffect(() => {
    if (nFailures >= 3) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [nFailures]);

  useAPICall<boolean>('/test', { interval: 5000, callback: checkHeartbeat }, false);

  return (
    <Modal
      opened={true}
      onClose={() => {}}
      closeButtonProps={{ icon: undefined }}
      centered
      size="60%"
      styles={{ body: { background: 'var(--mantine-color-red-9)' } }}
    >
      <Text>Test</Text>
    </Modal>
  );
}
