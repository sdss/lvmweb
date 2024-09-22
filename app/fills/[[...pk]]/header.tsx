/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Group, Loader, NativeSelect, Title } from '@mantine/core';
import { FillListType } from './types';

export function Header(props: {
  pk: number | null;
  records: FillListType;
  status: boolean | null;
}) {
  const [data, setData] = React.useState<{ label: string; value: string }[]>([]);

  const router = useRouter();

  React.useEffect(() => {
    if (props.records.size === 0) {
      return;
    }

    const newData = Array.from(props.records.keys()).map((pk) => ({
      value: pk.toString(),
      label: props.records.get(pk) || '',
    }));
    setData(newData);
  }, [props.records]);

  return (
    <Group justify="flex-start" gap="lg">
      <Group gap="xs">
        <Title order={2}>Status:</Title>
        {props.status === null ? (
          <Loader size="sm" color="gray.7" />
        ) : (
          <Title order={2} c={props.status ? 'green.8' : 'red.9'}>
            {props.status ? 'succeeded' : 'failed'}
          </Title>
        )}
      </Group>
      <Box style={{ flexGrow: 1 }} />
      <NativeSelect
        value={(props.pk || 0).toString()}
        onChange={(event) => {
          router.push(`/fills/${parseInt(event.currentTarget.value, 10)}`);
        }}
        data={data}
        h={36}
      />
    </Group>
  );
}
