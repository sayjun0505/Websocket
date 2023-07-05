import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';
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
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectPermission } from 'app/store/permissionSlice';
import {
  addLineChannel,
  getChannel,
  newLineChannel,
  removeLineChannel,
  selectChannel,
  updateLineChannel,
} from '../store/channelSlice';
import ChannelsContext from '../ChannelsContext';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup.string().required('You must enter a channel name'),
  channelSecret: yup.string().required('You must enter a channel secret'),
  accessToken: yup.string().required('You must enter a access token'),
});

const ChannelLineForm = (props) => {
  const { setRightSidebarOpen, rightSidebarOpen } = useContext(ChannelsContext);
  const channel = useSelector(selectChannel);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const permission = useSelector(selectPermission);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      dispatch(newLineChannel());
    } else {
      dispatch(getChannel(routeParams.id));
    }
  }, [dispatch, routeParams]);

  useEffect(() => {
    if (channel && channel.data) reset({ ...channel.data });
  }, [channel, reset]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.channel && !permission.channel.create) {
        navigate('/settings/channels');
      }
    } else if (permission && permission.channel && !permission.channel.update) {
      navigate(-1);
    }
  }, [permission]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    if (routeParams.id === 'new') {
      dispatch(addLineChannel(data));
    } else {
      dispatch(updateLineChannel({ ...channel, line: { ...channel.data, ...data } }));
    }
  }

  function handleRemoveChannel() {
    dispatch(removeLineChannel(channel)).then(() => {
      navigate('/settings/channels');
    });
  }

  if (_.isEmpty(form) || !channel) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48 mt-48">
        <div className="w-full max-w-3xl">
          <Typography className="w-full font-bold truncate" variant="h5">
            {routeParams.id === 'new' ? 'Connecting LINE OA' : 'Editing LINE channel'}
          </Typography>

          <Divider className="mt-16 mb-24" />
        </div>
        <div className="mx-16">
          <Typography variant="h6" gutterBottom component="div">
            Get necessary values from your channel settings
          </Typography>

          {/* <Typography variant="subtitle1" gutterBottom component="div">
              1. Channel Name
            </Typography> */}
          <Typography variant="body1" gutterBottom component="div">
            - Click on the channel you created to access your channel settings
          </Typography>
          <Typography variant="body1" gutterBottom component="div">
            - Find the Channel name from Basic settings {'>'} Channel name.
          </Typography>
          <Typography variant="body1" gutterBottom component="div">
            - Find the Channel secret from Basic settings {'>'} Channel secret.
          </Typography>
          <Typography variant="body1" gutterBottom component="div">
            - Find the LINE ID from Messaging API {'>'} Bot basic ID.
          </Typography>
          <Typography variant="body1" gutterBottom component="div">
            - Then, scroll farther to Messaging API settings. There, you will see a Channel access
            token field, with an issue button. Click that button to get your access token
          </Typography>
          <a href="https://fox-doumentation.gitbook.io/fox-connect-documentation/add-messaging-channel/line-channel">
            More in documentation.
          </a>
        </div>

        <Divider className="m-16" />

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
                    <FuseSvgIcon size={20}>material-outline:public</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="channelSecret"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Channel Secret"
              placeholder="Channel Secret"
              id="channelSecret"
              error={!!errors.channelSecret}
              helperText={errors?.channelSecret?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>material-outline:verified_user </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="accessToken"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Access Token"
              placeholder="Access Token"
              id="accessToken"
              error={!!errors.accessToken}
              helperText={errors?.accessToken?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>material-outline:fingerprint </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="lineId"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Bot basic ID"
              placeholder="Bot basic ID"
              id="lineId"
              error={!!errors.lineId}
              helperText={errors?.lineId?.message}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>material-outline:alternate_email </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {routeParams.id !== 'new' && channel && channel.id && (
          <div className="flex w-full">
            <TextField
              className="mt-32"
              label="Webhook URL"
              id="webhook"
              variant="outlined"
              fullWidth
              value={`${process.env.REACT_APP_BACKEND_URL}/api/webhook/line/${btoa(channel.id)}`}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <FuseSvgIcon
                      size={20}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${process.env.REACT_APP_BACKEND_URL}/api/webhook/line/${btoa(
                            channel.id
                          )}`
                        );
                        dispatch(
                          showMessage({
                            message: 'Copied to clipboard!',
                            autoHideDuration: 1000,
                            variant: 'info',
                          })
                        );
                      }}
                    >
                      material-outline:content_copy
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
      </div>

      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Button
          color="error"
          onClick={handleRemoveChannel}
          disabled={!(permission && permission.channel && permission.channel.delete)}
        >
          Delete
        </Button>
        <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
          Back
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

export default ChannelLineForm;
