import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import FileCopy from '@mui/icons-material/FileCopy';
import IconButton from '@mui/material/IconButton';
// import _ from '@lodash';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectPermission } from 'app/store/permissionSlice';

// import { updateOrganization } from '../store/generalSlice';
import { getMotopress, selectOrganization, updateOrganization } from '../store/organizationSlice';

const container = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const defaultValues = {
  id: '',
  motopressUrl: '',
  motopressConsumerKey: '',
  motopressConsumerSecret: '',
  lineNotify: '',
};

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({});

function WorkingHoursSetting() {
  const dispatch = useDispatch();
  const organization = useSelector(selectOrganization);
  const permission = useSelector(selectPermission);
  const [updatable, setUpdatable] = useState(false);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    dispatch(getMotopress());
  }, [dispatch]);

  useEffect(() => {
    if (organization) {
      reset(organization.organization);
    }
  }, [organization, reset]);

  useEffect(() => {
    if (permission && permission.organization && permission.organization.update) {
      setUpdatable(!permission.organization.update);
    } else {
      setUpdatable(false);
    }
  }, [permission]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    dispatch(
      updateOrganization({
        ...organization.organization,
        motopressUrl: data.motopressUrl,
        motopressConsumerKey: data.motopressConsumerKey,
        motopressConsumerSecret: data.motopressConsumerSecret,
        lineNotify: data.lineNotify,
      })
    );
  }

  if (!organization) {
    return <FuseLoading />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="md:flex m-1 md:m-24">
        <div className="flex flex-col flex-1">
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Card component={motion.div} variants={item} className="mb-32">
              <CardHeader
                className="px-32 pt-24"
                title={
                  <span className="flex items-center space-x-8">
                    <Typography className="text-2xl font-semibold leading-tight">
                      Motopress
                    </Typography>
                  </span>
                }
              />

              <CardContent className="px-32">
                <div className="flex flex-col md:overflow-hidden pt-16">
                  <Controller
                    control={control}
                    name="motopressUrl"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        disabled={!updatable}
                        className="mb-24"
                        label="Motopress URL"
                        id="motopressUrl"
                        error={!!errors.name}
                        helperText={errors?.name?.message}
                        variant="outlined"
                        required
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="motopressConsumerKey"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        disabled={!updatable}
                        className="mb-24"
                        label="Consumer Key"
                        id="motopressConsumerKey"
                        // error={!!errors.name}
                        // helperText={errors?.name?.message}
                        variant="outlined"
                        required
                        fullWidth
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="motopressConsumerSecret"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled={!updatable}
                      className="mb-24"
                      label="Consumer Secret"
                      id="motopressConsumerSecret"
                      // error={!!errors.name}
                      // helperText={errors?.name?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="lineNotify"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled={!updatable}
                      className="mb-24"
                      label="LINE Notify Token"
                      id="lineNotify"
                      // error={!!errors.name}
                      // helperText={errors?.name?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />

                <div className="flex">
                  <TextField
                    // inputProps={{ readOnly: true }}
                    className="mb-24"
                    disabled={!updatable}
                    label="Webhook URL"
                    id="webhook"
                    variant="outlined"
                    fullWidth
                    value={`${process.env.REACT_APP_BACKEND_URL}/api/webhook/woocommerce/${btoa(
                      organization && organization.organization ? organization.organization.id : ''
                    )}`}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${
                                  process.env.REACT_APP_BACKEND_URL
                                }/api/webhook/woocommerce/${btoa(
                                  organization && organization.organization
                                    ? organization.organization.id
                                    : ''
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
                            size="large"
                          >
                            <FileCopy />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </CardContent>

              <Box
                className="card-footer flex flex-col px-32 py-24 border-t-1"
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? lighten(theme.palette.background.default, 0.4)
                      : lighten(theme.palette.background.default, 0.02),
                }}
              >
                <div className="flex flex-auto -mx-4">
                  <div className="flex flex-col flex-1 mx-4 items-end">
                    <div>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={onSubmit}
                        disabled={!updatable}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Box>
            </Card>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkingHoursSetting;
