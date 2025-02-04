/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2025-02-03
 *  @Filename: heartbeat.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { Modal, Text } from '@mantine/core';
import useAPICall, { APICallStatus } from '@/src/hooks/use-api-call';

export default function LVMWebHeartbeat() {
  const [nFailures, setNFailures] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);

  const checkHeartbeat = React.useCallback(
    (data: { result: boolean }, status: APICallStatus) => {
      if (!data || !data.result || status === APICallStatus.ERROR) {
        setNFailures((prev) => prev + 1);
      } else if (status === APICallStatus.OK) {
        setNFailures(0);
      }
    },
    []
  );

  React.useEffect(() => {
    if (nFailures >= 3) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [nFailures]);

  useAPICall<boolean>('/test', { interval: 10000, callback: checkHeartbeat }, false);

  return (
    <Modal
      opened={showModal}
      onClose={() => {}}
      closeButtonProps={{ icon: undefined }}
      radius={10}
      shadow="xl"
      centered
      overlayProps={{ blur: 5 }}
      size="60%"
      styles={{
        body: {
          padding: 48,
          alignContent: 'center',
        },
        header: {
          minHeight: 0,
          padding: 0,
        },
        close: { visibility: 'hidden', display: 'none' },
      }}
    >
      <Text style={{ justifySelf: 'center' }} size="20pt">
        Connection to the server cannot be established.
      </Text>
    </Modal>
  );
}
