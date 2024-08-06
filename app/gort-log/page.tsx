/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-05
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack, Title } from '@mantine/core';

export default function GortLogPage() {
  return (
    <>
      <Stack p={8} mt={2} gap="lg">
        <Title order={1}>GORT Log</Title>
        <Box ta="center" pt={8}>
          <iframe
            title="sci"
            id="Frame"
            style={{ width: '95%', height: '100vh', border: '1px black solid' }}
            src="http://localhost:8080/pwisci/vnc_lite.html?scale=true&path=pwisci/websockify"
          />
        </Box>
      </Stack>
    </>
  );
}
