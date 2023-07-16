/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-15
 *  @Filename: Home.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box } from '@mui/material';
import Enclosure from './Enclosure';

export default function Home() {
  return (
    <Box width='100%' p={3}>
      <Enclosure />
    </Box>
  );
}
