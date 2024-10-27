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
import { NightLogData } from './page';
import classes from './night-logs.module.css';

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
      <Button
        component={Link}
        href={`/gort-log/${mjd}`}
        variant="outline"
        classNames={{ root: classes['gort-button'] }}
      >
        Go to GORT log
      </Button>
    </Group>
  );
}
