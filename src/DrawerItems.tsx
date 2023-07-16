/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-11
 *  @Filename: DrawerItems.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import HomeIcon from '@mui/icons-material/Home';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Divider,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import logo from '/lvm_logo.png';

function DrawerToolbar() {
  return (
    <Toolbar style={{ paddingLeft: 16, paddingRight: 8 }}>
      <Link href='/'>
        <img src={logo} width={50} style={{ marginRight: 16 }} />
      </Link>
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

interface HeaderProps {
  text: string;
}

function Header(props: HeaderProps) {
  const { text } = props;

  return (
    <ListItem key={text} sx={{ pb: 0, pt: 2 }}>
      <ListItemText
        sx={{ my: 0 }}
        primary={text}
        primaryTypographyProps={{ variant: 'overline' }}
      />
    </ListItem>
  );
}

interface ItemProps {
  text: string;
  icon?: JSX.Element;
  variant?: 'main' | 'subitem';
  link?: string;
  newWindow?: boolean;
}

function Item(props: ItemProps) {
  const { text, icon, variant = 'main', link, newWindow = false } = props;

  const textVariant = variant === 'main' ? 'body1' : 'body2';

  const ItemText = () => {
    if (!newWindow)
      return <Typography variant={textVariant}>{text}</Typography>;
    return (
      <Stack direction='row' alignItems='center' spacing={1}>
        <Typography variant={textVariant}>{text}</Typography>
        <OpenInNewIcon sx={{ fontSize: 16 }} />
      </Stack>
    );
  };

  return (
    <ListItem
      key={text}
      disablePadding={icon === null}
      sx={{ py: variant === 'main' ? 1 : 0 }}
    >
      <ListItemButton
        target={newWindow ? '_blank' : ''}
        sx={{ py: 0 }}
        href={link || '/'}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={<ItemText />} />
      </ListItemButton>
    </ListItem>
  );
}

export default function DrawerItems() {
  return (
    <div>
      <DrawerToolbar />
      <Divider />
      <List>
        <Item text='Home' icon={<HomeIcon />} />

        <Header text='PlaneWave' />
        <Item text='Science' variant='subitem' link='/pwi/sci' />
        <Item text='Spec' variant='subitem' link='/pwi/spec' />
        <Item text='SkyE' variant='subitem' link='/pwi/skye' />
        <Item text='SkyW' variant='subitem' link='/pwi/skyw' />
        <Item text='Motor controllers' variant='subitem' link='/motan' />

        <Header text='Tools' />
        <Item
          text='Jupyter'
          variant='subitem'
          link='http://localhost:8080/jupyter'
          newWindow
        />
        <Item
          text='Grafana'
          variant='subitem'
          link='https://lvm-grafana.lco.cl'
          newWindow
        />
        <Item text='RabbitMQ' variant='subitem' link='/rabbitmq' />
        <Item text='Weather' variant='subitem' link='/weather' />
        <Item
          text='Webcams'
          variant='subitem'
          link='https://unifi.ui.com/consoles/74ACB9EAA1330000000004EEE703000000000527B72A000000005F3370F7:1394809887/protect/timelapse/6446d73003a1b503e401550a'
          newWindow
        />

        <Header text='Documentation' />
        <Item
          text='Operations Manual'
          variant='subitem'
          link='https://wiki.sdss.org/display/LVM/Local+Volume+Mapper+Instrument+Operations+and+Maintenance+Manual'
          newWindow
        />
        <Item text='GORT' variant='subitem' link='/docs/gort' />
      </List>
    </div>
  );
}
