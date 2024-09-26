/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-24
 *  @Filename: copy-send.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { IconSend } from '@tabler/icons-react';
import { Button, ButtonProps, Group, rem } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import classes from './night-logs.module.css';

type EmailButtonProps = {
  mjd: number | null;
  variant?: ButtonProps['variant'];
  label?: string;
  refresh?: () => Promise<void>;
  disabled?: boolean;
};

export function EmailButton(props: EmailButtonProps) {
  const {
    mjd,
    variant = 'filled',
    label = 'Send email',
    refresh,
    disabled = false,
  } = props;

  const [labelState, setLabelState] = React.useState(label);
  const [loading, setLoading] = React.useState(false);

  const sendEmail = React.useCallback(() => {
    setLoading(true);

    fetchFromAPI(`/logs/night-logs/${mjd}/email`)
      .catch(() => {
        notifications.show({
          message: 'Email failed to send',
          autoClose: 5000,
          withCloseButton: true,
          color: 'red.8',
          style: { width: rem(200), height: rem(60) },
        });
      })
      .then(() => {
        if (refresh) {
          refresh();
        }

        setLabelState('Email sent!');
        setTimeout(() => setLabelState(label), 3000);
      })
      .finally(() => setLoading(false));
  }, [mjd]);

  if (!mjd) {
    return null;
  }

  return (
    <Button
      variant={variant}
      leftSection={<IconSend />}
      onClick={sendEmail}
      loading={loading}
      disabled={disabled}
      classNames={{ root: classes['email-button'] }}
    >
      {labelState}
    </Button>
  );
}

type CopySendProps = {
  mjd: number | null;
  refresh?: () => Promise<void>;
  sent?: boolean;
};

export default function CopySend(props: CopySendProps) {
  const { mjd, sent = false, refresh } = props;

  const [loading, setLoading] = React.useState(false);
  const clipboard = useClipboard({ timeout: 2000 });

  const copyToClipboard = React.useCallback(() => {
    if (!mjd) {
      return;
    }

    setLoading(true);

    fetchFromAPI<string>(`/logs/night-logs/${mjd}/plaintext`)
      .then((data) => clipboard.copy(data))
      .catch(() => {
        notifications.show({
          message: 'Could not copy to clipboard',
          autoClose: 5000,
          withCloseButton: true,
          color: 'red.8',
          style: { width: rem(250), height: rem(60) },
        });
      })
      .finally(() => setLoading(false));
  }, [mjd]);

  if (!mjd) {
    return null;
  }

  return (
    <Group justify="flex-end" w="100%">
      <Button variant="default" w={160} onClick={copyToClipboard} loading={loading}>
        {clipboard.copied ? 'Copied!' : 'Copy to clipboard'}
      </Button>
      <EmailButton mjd={mjd} refresh={refresh} disabled={sent} />
    </Group>
  );
}
