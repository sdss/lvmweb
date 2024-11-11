/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-23
 *  @Filename: observers.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import Link from 'next/link';
import { IconCheck } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Group,
  Input,
  Loader,
  Title,
  Tooltip,
} from '@mantine/core';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import GrafanaIcon from './GrafanaIcon';
import { NightLogData } from './page';
import classes from './night-logs.module.css';

function MJDToUnix(mjd: number) {
  return (mjd - 40587) * 86400 * 1000;
}

function GrafanaButton(props: { mjd: number | null }) {
  const now = new Date().getTime();

  // Even in winter the night never starts before 23:00 UT and ends before 11:00 UT
  const startUnix = props.mjd ? MJDToUnix(props.mjd - 0.042) : 'now-30m';
  let endUnix = props.mjd ? MJDToUnix(props.mjd + 0.46) : now;

  if (endUnix > now) {
    endUnix = now;
  }

  return (
    <Tooltip label="Go to guiding dashboard">
      <ActionIcon
        component={Link}
        href={`https://lvm-grafana.lco.cl/d/edad41a2-ada5-4f63-8bfa-8c182ed1386f/guiding?orgId=1&from=${startUnix}&to=${endUnix}`}
        target="_blank"
        rel="noreferrer"
        variant="transparent"
        size="lg"
      >
        <GrafanaIcon className={classes['grafana-button']} height={24} width={24} />
      </ActionIcon>
    </Tooltip>
  );
}

type ObserverProps = {
  mjd: number | null;
  data: NightLogData | null;
  current: boolean;
};

export default function Observers(props: ObserverProps) {
  const [currentValue, setCurrentValue] = React.useState<string | null>(null);
  const [newValue, setNewValue] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);

  const { data, mjd, current } = props;

  React.useEffect(() => {
    if (!data) {
      return;
    }

    setCurrentValue(data.observers);
    setNewValue(data.observers);
  }, [data]);

  const discard = React.useCallback(() => {
    // Discard changes

    setNewValue(currentValue);
  }, [currentValue]);

  const saveChanges = React.useCallback(
    (newValue: string | null) => {
      // Save changes

      if (newValue === currentValue || !mjd) {
        return;
      }

      setLoading(true);

      fetchFromAPI(`/logs/night-logs/comments/add`, {
        method: 'POST',
        body: JSON.stringify({ mjd, category: 'observers', comment: newValue }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(() => setCurrentValue(newValue))
        .then(() => setLoading(false));
    },
    [currentValue, mjd]
  );

  return (
    <Group gap="xs" my={15}>
      <Title order={3}>Observers:</Title>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveChanges(newValue);
        }}
      >
        <Input
          bg="var(--dark-background)"
          miw={300}
          maw={500}
          value={newValue || 'No observers listed'}
          onChange={(event) => setNewValue(event.currentTarget.value)}
          readOnly={!current}
          rightSectionPointerEvents="all"
          rightSection={
            currentValue !== newValue && (
              <Tooltip label="Discard changes">
                <CloseButton onClick={discard} />
              </Tooltip>
            )
          }
        />
      </form>
      {currentValue !== newValue &&
        (!loading ? (
          <Tooltip label="Save changes">
            <ActionIcon
              variant="transparent"
              onClick={() => saveChanges(newValue)}
              c="#B8B8B8"
            >
              <IconCheck />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Loader size="sm" color="#B8B8B8" />
        ))}
      <Box style={{ flexGrow: 1 }} />
      <Group gap="xs">
        <Button
          component={Link}
          href={`/gort-log/${mjd}`}
          variant="outline"
          classNames={{ root: classes['gort-button'] }}
        >
          Go to GORT log
        </Button>
        <GrafanaButton mjd={mjd} />
      </Group>
    </Group>
  );
}
