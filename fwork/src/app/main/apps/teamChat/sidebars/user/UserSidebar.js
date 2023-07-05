// import { useDebounce } from '@fuse/hooks';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
// import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
// import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useContext, useEffect } from 'react';
import _ from '@lodash';
// import { closeUserSidebar } from './store/sidebarsSlice';
// import { updateUserData } from './store/userSlice';
import { Box, Button, lighten } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ContactAvatar, Statuses } from 'app/shared-components/chat';
import { selectUser } from 'app/store/userSlice';
import { updateProfileIsOnline } from 'src/app/main/pages/profile/store/profileSlice';
import TeamChatAppContext from '../../TeamChatAppContext';

const UserSidebar = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const { setUserSidebarOpen } = useContext(TeamChatAppContext);
  const { control, handleSubmit, watch, reset, formState } = useForm({ defaultValues: user.data });
  const { isValid, dirtyFields, errors } = formState;

  const form = watch();
  useEffect(() => {
    reset(user.data);
  }, [reset, user]);

  function onSubmit(data) {
    dispatch(updateProfileIsOnline(data));
  }

  if (_.isEmpty(form)) {
    return null;
  }

  //   const updateUser = useDebounce((_form) => {
  //     dispatch(updateUserData(_form));
  //   }, 500);

  //   useEffect(() => {
  //     if (!user) {
  //       return;
  //     }

  //     if (!_.isEqual(user, form)) {
  //       updateUser(form);
  //     }
  //   }, [user, form, updateUser]);

  return (
    <div className="flex flex-col flex-auto h-full">
      <Box
        className="border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="flex items-center px-24">
          <IconButton onClick={() => setUserSidebarOpen(false)} color="inherit" size="small">
            <FuseSvgIcon className="text-48" size={16}>
              heroicons-outline:arrow-left
            </FuseSvgIcon>
          </IconButton>
          <div className="flex flex-row justify-start space-x-5 items-center">
            <Typography className="px-4 font-medium text-16" variant="subtitle1">
              Profile
            </Typography>
          </div>
        </Toolbar>
      </Box>

      <div className="flex flex-col justify-center items-center py-32">
        <ContactAvatar className="w-160 h-160 text-64" contact={user.data} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 p-24">
          {/* <FormControl component="fieldset" className="w-full mb-16">
            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mood"
                  className="w-full"
                  margin="normal"
                  multiline
                  variant="outlined"
                />
              )}
            />
          </FormControl> */}
          <FormControl component="fieldset" className="w-full mb-16">
            <FormLabel component="legend">Status</FormLabel>
            <Controller
              name="isOnline"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} aria-label="Status" name="status">
                  {Statuses.map((status) => (
                    <FormControlLabel
                      key={status.value}
                      value={status.value}
                      control={<Radio />}
                      label={
                        <div className="flex items-center">
                          <Box
                            className="w-8 h-8 rounded-full"
                            sx={{ backgroundColor: status.color }}
                          />
                          <span className="mx-8">{status.title}</span>
                        </div>
                      }
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </div>
        <Box
          className="border-t-1 min-h-80 flex flex-row items-center justify-center sm:justify-end px-0 sm:px-20"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <Button onClick={() => setUserSidebarOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            className="mx-8"
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            Save
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default UserSidebar;
