/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-16
 *  @Filename: Enclosure.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import CancelIcon from '@mui/icons-material/Cancel';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  LinearProgress,
  Skeleton,
  Slider,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import React from 'react';
import sendCommand from '../sendCommand';

interface EnclosureHeaderProps {
  status: string | null;
}

function EnclosureHeader(props: EnclosureHeaderProps) {
  const { status } = props;

  let message = '';
  if (status?.includes('MOVING')) {
    if (status?.includes('MOTOR_OPENING')) {
      message = 'opening';
    } else if (status.includes('MOTOR_CLOSING')) {
      message = 'closing';
    } else {
      ('moving');
    }
  } else if (status?.includes('POSITION_UNKNOWN')) {
    message = 'unknown position';
  } else if (status?.includes('OPEN')) {
    message = 'open';
  } else if (status?.includes('CLOSED')) {
    message = 'closed';
  } else {
    message = 'unknown';
  }

  if (!status || !message) return <Skeleton animation='wave' />;

  return <Typography variant='h6'>Roll-off status: {message}</Typography>;
}

interface EmergencyStopButtonProps {
  status: string | null;
}

function EmergencyStopButton(props: EmergencyStopButtonProps) {
  const { status } = props;

  if (!status)
    return <Skeleton animation='wave' variant='rectangular' height='80px' />;

  return (
    <Button
      variant='contained'
      color='error'
      sx={{
        minHeight: '80px',
        fontSize: 20,
        backgroundColor: 'error.dark',
      }}
      disableRipple={false}
    >
      Emergency close
    </Button>
  );
}

const PrettoSlider = styled(Slider)({
  color: '#52af77',
  height: 12,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-mark': {
    display: 'none',
  },
  '& .MuiSlider-markLabel': {
    paddingTop: '10px',
  },
});

interface EnclosureSliderProps {
  status: string | null;
}

function EnclosureSlider(props: EnclosureSliderProps) {
  const { status } = props;

  const [domePosition, setDomePosition] = React.useState(0.5);
  const [domePositionRequested, setDomePositionRequested] = React.useState(-1);

  const [isPositionUnknown, setIsPositionUnknown] = React.useState(true);
  const [isMoving, setIsMoving] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const marks = [
    {
      value: 0,
      label: 'Closed',
    },
    {
      value: 0.5,
      label: '',
    },
    {
      value: 1,
      label: 'Open',
    },
  ];

  React.useEffect(() => {
    if (status?.includes('OPEN') && !status?.includes('OPENING')) {
      setDomePosition(1);
      setIsPositionUnknown(false);
    } else if (status?.includes('CLOSED')) {
      setDomePosition(0);
      setIsPositionUnknown(false);
    } else {
      setDomePosition(0.5);
      setIsPositionUnknown(true);
    }
  }, [status]);

  const stopEnclosure = () => {
    sendCommand('enclosure_action', { action: 'stop' })
      .then(() => {})
      .catch(() => {});
  };

  if (!status)
    return <Skeleton animation='wave' variant='rectangular' height='30px' />;

  if (status.includes('MOVING') || isMoving) {
    return (
      <Stack direction='row'>
        <Box flexGrow={1} alignSelf='center' px={2}>
          <LinearProgress sx={{ height: 10, borderRadius: 3 }} />
        </Box>
        <IconButton size='large' sx={{ p: 1 }} onClick={stopEnclosure}>
          <CancelIcon />
        </IconButton>
      </Stack>
    );
  }

  const handleSliderChange = (_: Event, value: number | number[]) => {
    setDomePositionRequested(value as number);
    setDialogOpen(true);
  };

  const handleAction = () => {
    if (domePositionRequested < 0) return;

    sendCommand('enclosure_action', {
      action: domePositionRequested === 1 ? 'open' : 'close',
    })
      .then((result) => {
        if (result.error) {
          setDomePosition(0.5);
          setIsPositionUnknown(true);
          setIsMoving(false);
        } else {
          setDomePosition(domePositionRequested);
          setIsPositionUnknown(false);
          setIsMoving(false);
        }
      })
      .catch(() => {});

    setIsPositionUnknown(true);
    setIsMoving(true);
    setDomePosition(0.5);
    setDialogOpen(false);
  };

  return (
    <Box px={2}>
      <PrettoSlider
        value={domePosition}
        step={isPositionUnknown ? 0.5 : 1}
        min={0}
        max={1}
        marks={marks}
        onChange={handleSliderChange}
      />
      <Dialog open={dialogOpen}>
        <DialogTitle>Are you sure you want to open/close the dome?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAction} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function Enclosure() {
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    const commandLoop = setInterval(
      () =>
        sendCommand('enclosure_status')
          .then((value) => {
            if ('dome_status_labels' in value) {
              setStatus(value.dome_status_labels as string);
            }
          })
          .catch(() => setStatus(null)),
      2000
    );
    return () => clearInterval(commandLoop);
  }, []);

  return (
    <Box width='20%'>
      <Stack direction='column' textAlign='center' spacing={2}>
        <EnclosureHeader status={status} />
        <EmergencyStopButton status={status} />
        <EnclosureSlider status={status} />
      </Stack>
    </Box>
  );
}
