/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-11
 *  @Filename: DrawerItems.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import logo from '/lvm_logo.png';

function DrawerToolbar() {
  return (
    <Toolbar style={{ paddingLeft: 16, paddingRight: 8 }}>
      <img src={logo} width={50} style={{ marginRight: 8 }} />
      <Divider orientation='vertical' variant='middle' flexItem />
      <Box flexGrow={1}>
        <Typography
          variant='body1'
          fontWeight={700}
          textAlign='center'
          color='text.disabled'
        >
          LVM Web
        </Typography>
      </Box>
    </Toolbar>
  );
}
export default function DrawerItems() {
  return (
    <div>
      <DrawerToolbar />
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
