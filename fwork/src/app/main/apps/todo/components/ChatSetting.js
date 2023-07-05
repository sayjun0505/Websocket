import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Checkbox from '@mui/material/Checkbox';

import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Controller, useForm } from 'react-hook-form';

import FormControlLabel from '@mui/material/FormControlLabel';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import _ from '@lodash';
import useMediaQuery from '@mui/material/useMediaQuery';
import { updateChat, updateChatOwner } from '../store/chatSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
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
  const [userList, setUserList] = useState([]);
  const selected = useSelector(({ chatApp }) => chatApp.current.selected);

  const org = useSelector(({ auth }) => auth.organization.organization);

  // Chat Owner handle
  const getUserList = async () => {
    const token = await firebaseAuthService.getAccessToken();
    if (!token) return;
    const response = await axios.get(`/api/${org.id}/user/list`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const list = await response.data;
    setUserList(list);
  };
  const handleOwnerChange = async (e) => {
    if (e.target.value && e.target.value !== '')
      dispatch(
        updateChatOwner({
          ...selected,
          owner: e.target.value.user,
        })
      );
  };
  useEffect(() => {
    getUserList();
  }, []);

  return (
    <>
      {/* Chat Owner */}
      <FormControl
        className={classes.formControl}
        // variant="outlined"
      >
        <InputLabel id="demo-simple-select-label" className="text-white">
          Owner
        </InputLabel>
        <Select
          labelId="owner-label"
          id="owner-select"
          className="h-full text-white border-slate-100"
          value={selected && selected.owner ? selected.owner : ''}
          // disableUnderline
          onChange={handleOwnerChange}
          renderValue={(el) => {
            if (props.isMobile) return <div className="text-gray-900">{el.firstname}</div>;
            return <div className="text-gray-100">{el.firstname}</div>;
          }}
        >
          {userList.map((value, index) => (
            <MenuItem key={index} value={value}>
              {value.user.firstname} {value.user.lastname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export const ChatStatusSetting = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [userList, setUserList] = useState([]);
  const selected = useSelector(({ chatApp }) => chatApp.current.selected);
  const org = useSelector(({ auth }) => auth.organization.organization);

  const handleStatusChange = async (e) => {
    dispatch(
      updateChat({
        ...selected,
        status: e.target.value,
      })
    );
  };

  return (
    <>
      {/* Chat Status */}
      <FormControl
        // className={classes.formControl}
        className="h-full text-white border-white m-10"
        // variant="outlined"
      >
        <InputLabel id="demo-simple-select-label" className="text-white border-white">
          Status
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selected && selected.status ? selected.status : ''}
          className="h-full text-white border-white"
          // disableUnderline
          onChange={handleStatusChange}
          renderValue={(status) => {
            // console.log(props);
            if (props.isMobile) return <div className="text-gray-900">{status}</div>;
            return <div className="text-gray-100">{status}</div>;
          }}
          //   // <div className={classes.chips}>
          //   //   <Chip size="small" key={el.id} label={el.user.firstname} className={classes.chip} />
          //   // </div>
          //   // <div className={classes.chips}>
          //   //   <Chip size="small" key={status} label={status} />
          //   // </div>
          // )}
        >
          <MenuItem key={1} value="open">
            Open
          </MenuItem>
          <MenuItem key={2} value="none">
            Resolved
          </MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export const TicketDetailSetting = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const chat = useSelector(({ chatApp }) => chatApp.current.selected);
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
      {/*  Button Open Dialog */}
      <div className="flex w-full items-center">
        <Button
          className="m-8 "
          variant="contained"
          size="medium"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Edit Ticket Detail
        </Button>
      </div>

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
            <Typography variant="subtitle1" color="inherit">
              Ticket Detail
            </Typography>
          </Toolbar>
        </AppBar>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:overflow-hidden"
        >
          <DialogContent classes={{ root: 'p-24' }}>
            <div className="flex">
              {/* <div className="min-w-48 pt-20">
              <Icon color="action">account_circle</Icon>
            </div> */}
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
  const chat = useSelector(({ chatApp }) => chatApp.current.selected);
  const org = useSelector(({ auth }) => auth.organization.organization);

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

  return (
    <div className="flex flex-col" style={{ margin: '10px' }}>
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

export const OpenHistoryButton = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const chat = useSelector(({ chatApp }) => chatApp.current.selected);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  function openHistory() {
    props.handleClose();
    // dispatch(getHistory({ historyId: chat.customer.id, isMobile }));
  }

  return (
    <>
      {/*  Button Open Dialog */}
      <div className="flex w-full items-center">
        <Button className="m-8 " variant="contained" size="medium" onClick={openHistory}>
          Open History
        </Button>
      </div>
    </>
  );
};
