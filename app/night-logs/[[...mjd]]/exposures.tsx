/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-24
 *  @Filename: exposures.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Code, Stack, Text, Title } from '@mantine/core';
import classes from './night-logs.module.css';

type ExposuresProps = {
  exposure_data: string | null;
};

export default function Exposures(props: ExposuresProps) {
  const { exposure_data } = props;

  return (
    <Stack gap="sm">
      <Box w="100%">
        <Title order={3}>Exposures</Title>
        <hr className={classes.line} />
      </Box>
      {exposure_data ? (
        <Code block p={24}>
          {exposure_data}
        </Code>
      ) : (
        <Text size="sm" fs="italic">
          No exposures yet.
        </Text>
      )}
    </Stack>
  );
}
