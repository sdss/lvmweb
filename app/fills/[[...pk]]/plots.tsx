/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Image, Paper, Stack, Title } from '@mantine/core';

function Plot(props: { data: string }) {
  const image = `data:image/png;base64,${props.data}`;
  return (
    <Paper withBorder radius={5} bg="var(--dark-background)" shadow="sm">
      <Image src={image} />
    </Paper>
  );
}

export function Plots(props: { plot_data: { [key: string]: string } | null }) {
  if (!props.plot_data) {
    return;
  }

  return (
    <Stack gap="sm">
      <Title order={2} c="dark.2">
        Plots{' '}
      </Title>
      <Stack gap="md">
        {Object.keys(props.plot_data).map((key) => {
          return (
            <Box key={key}>
              <Plot data={props.plot_data![key]} />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );

  return;
}
