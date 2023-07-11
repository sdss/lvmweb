/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-11
 *  @Filename: App.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { ThemeProvider } from '@emotion/react';
import { CssBaseline, createTheme } from '@mui/material';
import Layout from './Layout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  );
}
