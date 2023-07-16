/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-15
 *  @Filename: IFrame.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box } from '@mui/material';
import usePath from './usePath';

export default function IFrame() {
  const { url, className } = usePath();

  return (
    <Box width='100%' textAlign='center'>
      <iframe id='Frame' className={className} src={url} />
    </Box>
  );
}
