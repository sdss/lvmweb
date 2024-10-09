/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-10-09
 *  @Filename: error-alert.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { IconExclamationCircle } from '@tabler/icons-react';
import { Alert } from '@mantine/core';

export default function ErrorAlert(props: { error: string | null }) {
  if (!props.error) {
    return null;
  }

  return (
    <Alert
      variant="light"
      color="red.8"
      icon={<IconExclamationCircle />}
      mb={24}
      title="Error"
    >
      {props.error}
    </Alert>
  );
}
