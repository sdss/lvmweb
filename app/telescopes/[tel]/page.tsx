/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-06
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { Box, Stack, Title } from '@mantine/core';
import TelescopePositionPlot from '@/src/components/TelescopePositionPlot/TelescopePositionPlot';

type TelescopePageProps = {
  params: Promise<{ tel: string }>;
};

export default function TelescopePage(props: TelescopePageProps) {
  const paramsUse = React.use(props.params);

  const [valid, setValid] = React.useState<boolean>(true);
  const [src, setSrc] = React.useState<string | undefined>(undefined);
  const [title, setTitle] = React.useState<string | undefined>(undefined);

  const { tel } = paramsUse;
  const BASE_URL = 'http://localhost:8090/';

  React.useEffect(() => {
    if (tel === 'motan') {
      setSrc(`${BASE_URL}/motan/default`);
      setTitle('Motor controller');
    } else {
      setSrc(
        `${BASE_URL}/pwi${tel}/vnc_lite.html?scale=true&path=pwi${tel}/websockify`
      );
      switch (tel) {
        case 'sci':
          setTitle('Science telescope');
          break;
        case 'spec':
          setTitle('Spec telescope');
          break;
        case 'skyw':
          setTitle('Sky-W telescope');
          break;
        case 'skye':
          setTitle('Sky-E telescope');
          break;
        default:
          setValid(false);
      }
    }
  }, [tel]);

  if (!tel) {
    return null;
  }

  if (tel === 'position') {
    return (
      <Stack p={8} mt={2} gap="lg">
        <Title order={1}>Telescope Position</Title>
        <Box ta="center" pt={24}>
          <TelescopePositionPlot size="large" />
        </Box>
      </Stack>
    );
  }

  if (!valid) {
    return <h1>404 - Page Not Found</h1>;
  }

  return (
    <>
      <Stack p={8} mt={2} gap="lg">
        <Title order={1}>{title}</Title>
        <Box ta="center" pt={8}>
          <iframe
            title="sci"
            id="Frame"
            style={{ width: '95%', height: '100vh', border: '1px black solid' }}
            src={src}
          />
        </Box>
      </Stack>
    </>
  );
}
