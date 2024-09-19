/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Code, Paper, Stack, Text, Title } from '@mantine/core';

function formatLine(line: string, key: number): React.ReactElement {
  let bgColor = 'inherit';
  if (line.includes('- ERROR -') || line.includes('- CRITICAL -')) {
    bgColor = 'red.9';
  }

  let color = 'inherit';
  if (line.includes('- DEBUG -')) {
    color = 'gray.6';
  } else if (line.includes('- WARNING -')) {
    color = 'yellow.7';
  }

  return (
    <Text key={key} size="xs" c={color} bg={bgColor} px={16}>
      {line}
    </Text>
  );
}

export function LogDisplay(props: { data: string | null }) {
  if (!props.data) {
    return;
  }

  return (
    <Stack gap="sm" py={16}>
      <Title order={2} c="dark.2">
        Log
      </Title>
      <Paper radius={5} withBorder>
        <Code block px={0} bg="var(--dark-background)" style={{ borderRadius: 5 }}>
          {props.data.split('\n').map((line, index) => formatLine(line, index))}
        </Code>
      </Paper>
    </Stack>
  );
}
