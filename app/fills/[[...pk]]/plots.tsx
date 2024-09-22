/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { Box, Image, Paper, Stack, Title } from '@mantine/core';
import getSystemFile from '@/src/actions/get-system-image';

function Plot(props: { file: string }) {
  const [imageData, setImageData] = React.useState<string | null>(null);

  React.useEffect(() => {
    getSystemFile(props.file)
      .then((data) => {
        setImageData(data);
      })
      .catch(() => {
        setImageData(null);
      });
  }, [props.file]);

  if (!imageData) {
    return null;
  }

  return (
    <Paper withBorder radius={5} bg="var(--dark-background)" shadow="sm">
      <Image src={`data:image/png;base64,${imageData}`} />
    </Paper>
  );
}

export function Plots(props: { plot_data: { [key: string]: string } | null }) {
  if (!props.plot_data || Object.keys(props.plot_data).length === 0) {
    return;
  }

  return (
    <Stack gap="sm">
      <Title order={2} c="dark.2">
        Plots
      </Title>
      <Stack gap="md">
        {Object.keys(props.plot_data).map((key) => {
          return (
            <Box key={key}>
              <Plot file={props.plot_data![key]} />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );

  return;
}
