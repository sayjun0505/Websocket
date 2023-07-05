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
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
// import Checkbox from '@mui/material/Checkbox/Checkbox';
import { selectPermission } from 'app/store/permissionSlice';
import { addTeam, getTeam, newTeam, removeTeam, selectTeam, updateTeam } from '../store/teamSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup.string().required('You must enter a name'),
});

const TeamForm = (props) => {
  const team = useSelector(selectTeam);
  const permission = useSelector(selectPermission);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();

  useEffect(() => {
    if (routeParams.id === 'new') {
      dispatch(newTeam());
    } else {
      dispatch(getTeam(routeParams.id));
    }
  }, [dispatch, routeParams]);

  useEffect(() => {
    reset({ ...team });
  }, [team, reset]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.team && !permission.team.create) {
        navigate('/settings/teams');
      }
    } else if (permission && permission.team && !permission.team.update) {
      navigate(-1);
    }
  }, [permission]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    if (routeParams.id === 'new') {
      dispatch(addTeam({ ...team, ...data }));
    } else {
      dispatch(updateTeam({ ...team, ...data }));
    }
  }

  function handleRemoveTeam() {
    dispatch(removeTeam(team.id)).then(() => {
      navigate('/settings/teams');
    });
  }

  if (_.isEmpty(form) || !team) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48 mt-48">
        <div className="w-full max-w-3xl">
          <Typography className="mt-12 text-4xl font-bold truncate">
            {routeParams.id === 'new' ? 'Add new team' : 'Edit team'}
          </Typography>

          <Divider className="mt-16 mb-24" />
        </div>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Name"
              placeholder="Name"
              id="name"
              error={!!errors.name}
              helperText={errors?.name?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:user-group</FuseSvgIcon>
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
          onClick={handleRemoveTeam}
          disabled={!(permission && permission.team && permission.team.delete)}
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

export default TeamForm;
