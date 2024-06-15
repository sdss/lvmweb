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

function EmergencyStopButton() {
  const [label, setLabel] = React.useState('Emergency shutdown');
  const [disabled, setDisabled] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (disabled) {
      setLabel('Shutting down ...');
    } else {
      setLabel('Emergency shutdown');
    }
  }, [disabled]);

  const handleShutdown = () => {
    setDisabled(true);
    setDialogOpen(false);

    fetch('api/macros/shutdown')
      .then(() => {})
      .catch(() => {})
      .finally(() => setDisabled(false));
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant='contained'
        color='error'
        disabled={disabled}
        sx={{
          minHeight: '80px',
          fontSize: 20,
          backgroundColor: 'error.dark',
        }}
        disableRipple={false}
      >
        {label}
      </Button>
      <Dialog open={dialogOpen}>
        <DialogTitle>Execute emergency shutdown?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShutdown} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
    switch (status) {
      case 'moving':
        setIsMoving(true);
        break;
      case 'closed':
        setDomePosition(0);
        setIsPositionUnknown(false);
        setIsMoving(false);
        break;
      case 'open':
        setDomePosition(1);
        setIsPositionUnknown(false);
        setIsMoving(false);
        break;
      default:
        setDomePosition(0.5);
        setIsPositionUnknown(true);
        setIsMoving(false);
    }
  }, [status]);

  const stopEnclosure = () => {
    fetch('api/enclosure/stop')
      .then(() => {})
      .catch(() => {});
  };

  if (!status)
    return <Skeleton animation='wave' variant='rectangular' height='30px' />;

  if (status === 'moving' || isMoving) {
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

    const action = domePositionRequested === 1 ? 'open' : 'close';

    fetch(`api/enclosure/${action}`)
      .then((result) => {
        if (result.status !== 200) {
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

async function parseEnclosureResponse(response: Response) {
  if (response.status !== 200) return null;

  const data = await response.json();
  const domeStatus = data['dome_status']['labels'];

  if (domeStatus.includes('MOVING')) {
    return 'moving';
  } else if (domeStatus.includes('CLOSED')) {
    return 'closed';
  } else if (domeStatus.includes('OPEN')) {
    return 'open';
  } else if (domeStatus.includes('POSITION_UNKNOWN')) {
    return null;
  } else {
    return null;
  }
}

export default function Enclosure() {
  const [rolloffStatus, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    const commandLoop = setInterval(
      () =>
        fetch('api/enclosure/status')
          .then(parseEnclosureResponse)
          .then((status: string | null) => setStatus(status))
          .catch(() => setStatus(null)),
      2000
    );
    return () => clearInterval(commandLoop);
  }, []);

  return (
    <Box width='20%'>
      <Stack direction='column' textAlign='center' spacing={2}>
        <Typography variant='h6'>Roll-off status: {rolloffStatus}</Typography>
        <EmergencyStopButton />
        <EnclosureSlider status={rolloffStatus} />
      </Stack>
    </Box>
  );
}
