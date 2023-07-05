import makeStyles from '@mui/styles/makeStyles';
import {
  AppBar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { showMessage } from 'app/store/fuse/messageSlice';
import _ from '@lodash';
import { selectMembers } from '../../../../store/membersSlice';
import { selectChat, updateChat } from '../../../../store/chatSlice';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 150,
    height: 30,
    marginTop: '1rem !important',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}));

export const ChatOwnerSetting = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const { user, userList } = useSelector(selectMembers);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMenuItem = async (value) => {
    if (value && value.user)
      dispatch(
        updateChat({
          ...chat,
          owner: value.user,
        })
      );
    handleClose();
  };

  return (
    <>
      {/* Chat Owner */}
      <Button
        id="chat-owner-button"
        aria-controls={open ? 'chat-owner-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        className="rounded border-gray"
      >
        <Typography className="capitalize font-medium">
          {chat.owner ? chat.owner.firstname : 'Owner'}
        </Typography>
      </Button>
      <Menu
        id="chat-owner-menu"
        aria-labelledby="chat-owner-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {userList.map((value, index) => (
          <MenuItem
            key={index}
            value={value}
            disabled={chat.owner && chat.owner.id === value.userId}
            onClick={() => {
              handleSelectMenuItem(value);
            }}
          >
            {value.user.firstname} {value.user.lastname}
            {user && value.userId === user.id && '(Me)'}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const ChatStatusSetting = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const chat = useSelector(selectChat);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status) => {
    dispatch(
      updateChat({
        ...chat,
        status,
      })
    );
  };

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
  });
  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    if (dialogOpen) {
      reset({
        ticketDetail: chat.ticketDetail,
      });
    }

    return () => {
      reset({
        ticketDetail: '',
      });
    };
  }, [dialogOpen, chat]);

  function onSubmit(data) {
    dispatch(
      updateChat({
        ...chat,
        description: data.ticketDetail,
      })
    )
      .then(() => {
        setDialogOpen(false);
        dispatch(
          showMessage({
            message: 'Ticket Detail success!',
            autoHideDuration: 2000, // ms
            anchorOrigin: {
              vertical: 'top', // top bottom
              horizontal: 'center', // left center right
            },
            variant: 'success', // success error info warning null
          })
        );
      })
      .catch((error) => {
        // console.error('[TicketDetailSetting] error ', error.message);
        dispatch(
          showMessage({
            message: 'Ticket Detail fail!',
            autoHideDuration: 2000, // ms
            anchorOrigin: {
              vertical: 'top', // top bottom
              horizontal: 'center', // left center right
            },
            variant: 'error', // success error info warning null
          })
        );
      });
  }

  return (
    <>
      {/* Chat Owner */}
      <Button
        id="demo-positioned-button"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        className="rounded border-gray"
      >
        <Typography className="capitalize font-medium">
          {chat.status ? chat.status : 'Status'}
        </Typography>
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem key={1} value="open" onClick={() => handleStatusChange('open')}>
          Open
        </MenuItem>
        <MenuItem key={2} value="Resolved" onClick={() => handleStatusChange('resolved')}>
          Resolved
        </MenuItem>
      </Menu>
    </>
  );
};

export const TicketDetailSetting = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
  });
  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    if (dialogOpen) {
      reset({
        ticketDetail: chat.ticketDetail,
      });
    }
    return () => {
      reset({
        ticketDetail: '',
      });
    };
  }, [dialogOpen, chat]);

  function onSubmit(data) {
    dispatch(
      updateChat({
        ...chat,
        description: data.ticketDetail,
      })
    )
      .then(() => {
        setDialogOpen(false);
        dispatch(
          showMessage({
            message: 'Ticket Detail success!',
            autoHideDuration: 1000,
            variant: 'success',
          })
        );
      })
      .catch((error) => {
        // console.error('[TicketDetailSetting] error ', error.message);
        dispatch(
          showMessage({
            message: 'Ticket Detail fail!',
            autoHideDuration: 2000,
            variant: 'error',
          })
        );
      });
  }

  return (
    <>
      <Button
        variant="outlined"
        className="rounded border-gray"
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        Edit Ticket Topic
      </Button>

      {/* Ticket Detail */}
      <Dialog
        fullWidth
        maxWidth="xs"
        className="m-24"
        onClose={() => {
          setDialogOpen(false);
        }}
        aria-labelledby="simple-dialog-title"
        open={dialogOpen}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar className="flex w-full">
            <Typography className="capitalize font-medium">Ticket Detail</Typography>
          </Toolbar>
        </AppBar>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:overflow-hidden"
        >
          <DialogContent classes={{ root: 'p-24' }}>
            <div className="flex">
              <Controller
                control={control}
                name="ticketDetail"
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    label="Ticket Detail"
                    id="ticketDetail"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    required
                    fullWidth
                  />
                )}
              />
            </div>
          </DialogContent>

          <DialogActions className="justify-between p-4 pb-16">
            <div className="px-16">
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={_.isEmpty(dirtyFields) || !isValid}
              >
                Save
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export const ChatFollowupSetting = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);

  const handleFollowup = async (e) => {
    dispatch(
      updateChat({
        ...chat,
        followup: e.target.checked,
      })
    );
  };
  const handleSpam = async (e) => {
    dispatch(
      updateChat({
        ...chat,
        spam: e.target.checked,
      })
    );
  };
  const handleArchived = async (e) => {
    dispatch(
      updateChat({
        ...chat,
        archived: e.target.checked,
      })
    );
  };

  return (
    <div className="flex flex-col" style={{ margin: '10px' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={chat.archived}
            onChange={handleArchived}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
          />
        }
        label="Archived Chat"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={chat.followup}
            onChange={handleFollowup}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
          />
        }
        label="Follow-Up"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={chat.spam}
            onChange={handleSpam}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        }
        label="Spam"
      />
    </div>
  );
};

// export const OpenHistoryButton = (props) => {
//   const chat = useSelector(selectChat);
//   return (
//     <>
//       {/* Button Open Chat history */}
//       <Button
//         component={Link}
//         variant="outlined"
//         className="rounded border-gray"
//         to={`/apps/chat/${chat.id}/history`}
//         onClick={props.onClose}
//       >
//         <Typography className="capitalize font-medium">Open History</Typography>
//       </Button>
//     </>
//   );
// };
