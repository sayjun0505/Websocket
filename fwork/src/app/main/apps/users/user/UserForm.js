import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from '@lodash';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import Box from '@mui/system/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
// import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
// import Checkbox from '@mui/material/Checkbox/Checkbox';
import { selectPermission } from 'app/store/permissionSlice';
import { useOrganization } from '../../../../organization/OrganizationContext';
import { addUser, getUser, newUser, removeUser, selectUser, updateUser } from '../store/userSlice';
import { selectTeamsOption } from '../store/teamsSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  display: yup.string().required('You must enter a display'),
});

const UserForm = (props) => {
  const { updateRole } = useOrganization();
  const user = useSelector(selectUser);
  // eslint-disable-next-line no-shadow
  const userId = useSelector(({ user }) => user.uuid);
  const permission = useSelector(selectPermission);
  const teams = useSelector(selectTeamsOption);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();
  const formEmail = watch('email');

  useEffect(() => {
    if (routeParams.id === 'new') {
      dispatch(newUser());
    } else {
      dispatch(getUser(routeParams.id));
    }
  }, [dispatch, routeParams]);

  useEffect(() => {
    // reset({ ...user });
    if (user && user.user) {
      reset({
        ...user.user,
        role: user.role,
        teamId: user.teamId,
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.user && !permission.user.create) {
        navigate('/settings/users');
      }
    } else if (permission && permission.user && !permission.user.update) {
      navigate(-1);
    }
  }, [permission]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    if (routeParams.id === 'new') {
      dispatch(addUser(data.email));
    } else {
      const { role } = data;
      const team = data.teamId ? teams.find((element) => element.id === data.teamId) : null;
      delete data.role;
      delete data.team;

      // console.log('[DATA] ', data);
      // console.log('[DATA] ', role);
      // console.log('[DATA] ', team);
      if (userId === data.id) {
        updateRole(role);
      }
      dispatch(
        updateUser({
          user: { ...data },
          role,
          team,
        })
      );
    }
  }

  function handleRemoveContact() {
    dispatch(removeUser(user)).then(() => {
      navigate('/settings/users');
    });
  }

  if (_.isEmpty(form) || !user) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48 mt-48">
        <Controller
          control={control}
          name="firstname"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Firstname"
              placeholder="Firstname"
              id="firstname"
              error={!!errors.firstname}
              helperText={errors?.firstname?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="lastname"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Lastname"
              placeholder="Lastname"
              id="lastname"
              error={!!errors.lastname}
              helperText={errors?.lastname?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="display"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Display name"
              placeholder="Display name"
              id="display"
              error={!!errors.display}
              helperText={errors?.display?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:identification</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-32"
              label="Email"
              placeholder="Email"
              variant="outlined"
              fullWidth
              disabled={formEmail && formEmail !== ''}
              error={!!errors.email}
              helperText={errors?.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:mail</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="mobile"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Mobile"
              placeholder="Mobile"
              id="mobile"
              error={!!errors.mobile}
              helperText={errors?.mobile?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-32">
              <InputLabel>Gender</InputLabel>
              <Select
                {...field}
                label="Gender"
                id="gender"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="undisclosed">Undisclosed</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Role */}
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-32">
              <InputLabel>Role</InputLabel>
              <Select
                {...field}
                label="Role"
                id="role"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                {/* <MenuItem value="user">User</MenuItem> */}
              </Select>
            </FormControl>
          )}
        />

        {/* Team */}
        <Controller
          control={control}
          name="teamId"
          renderValue={(selected) => {
            return <>{selected && JSON.parse(selected) ? JSON.parse(selected).name : ''}</>;
          }}
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-32">
              <InputLabel>Team</InputLabel>
              <Select
                {...field}
                label="Team"
                id="teamId"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              >
                {teams.map((option, index) => {
                  return (
                    <MenuItem key={index} value={option.id}>
                      {option.name}
                    </MenuItem>
                  );
                })}
                {/* <MenuItem value="user">User</MenuItem> */}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Address"
              placeholder="Address"
              id="address"
              error={!!errors.address}
              helperText={errors?.address?.message}
              variant="outlined"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              InputProps={{
                className: 'max-h-min h-min items-start',
                startAdornment: (
                  <InputAdornment className="mt-16" position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:home</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>

      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Button
          color="error"
          onClick={handleRemoveContact}
          disabled={!(permission && permission.user && permission.user.delete)}
        >
          Delete
        </Button>
        <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
          Cancel
        </Button>
        <Button
          className="ml-8"
          variant="contained"
          color="secondary"
          disabled={_.isEmpty(dirtyFields) || !isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </Box>
    </>
  );
};

export default UserForm;
