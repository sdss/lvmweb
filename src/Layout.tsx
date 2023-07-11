/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-11
 *  @Filename: Layout.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import MenuIcon from '@mui/icons-material/Menu';
import { Slide, useScrollTrigger } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import DrawerItems from './DrawerItems';

const drawerWidth = 240;

const contents = Array(50).fill(
  <Typography paragraph>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
    enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
    imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
    Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio
    morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing
    bibendum est ultricies integer quis. Cursus euismod quis viverra nibh cras.
    Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris
    commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
    vivamus at augue. At augue eget arcu dictum varius duis at consectetur
    lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien
    faucibus et molestie ac.
  </Typography>
);

interface HideOnScrollProps {
  children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction='down' in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <HideOnScroll>
        <AppBar
          position='fixed'
          elevation={0}
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' noWrap component='div' />
          </Toolbar>
          <Divider />
        </AppBar>
      </HideOnScroll>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label='mailbox folders'
      >
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <DrawerItems />
        </Drawer>
        <Drawer
          variant='permanent'
          sx={(theme) => ({
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              background: theme.palette.action.disabledBackground,
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          })}
          open
        >
          <DrawerItems />
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {contents}
      </Box>
    </Box>
  );
}
