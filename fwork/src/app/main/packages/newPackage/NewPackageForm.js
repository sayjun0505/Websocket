import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from '@lodash';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import Box from '@mui/system/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { selectUser } from 'app/store/userSlice';
import { selectSortPackage } from '../store/packagesSlice';
import { addActivation, newActivation, selectActivation } from '../store/activationSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  packageId: yup.string().required('You must select a package'),
  description: yup.string().required('You must enter a description'),
  paymentId: yup.string().required('You must select a payment'),
});

const paymentOption = [
  { id: 0, label: 'PromptPay: half-yearly price', type: 'PromptPay', option: 'halfYearly' },
  { id: 1, label: 'PromptPay: yearly price', type: 'PromptPay', option: 'yearly' },
  // { id: 2, label: 'Credit Card: monthly price', type: 'CreditCard', option: 'monthly' },
  // { id: 3, label: 'Credit Card: quarterly price', type: 'CreditCard', option: 'quarterly' },
  // { id: 4, label: 'Credit Card: yearly price', type: 'CreditCard', option: 'yearly' },
];

const NewPackageForm = (props) => {
  const user = useSelector(selectUser);
  const activation = useSelector(selectActivation);
  const packagesOption = useSelector(selectSortPackage);
  // const tags = useSelector(selectTags);
  const location = useLocation();
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectPayment, setSelectPayment] = useState(null);
  const [selectPackage, setSelectPackage] = useState(null);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();
  const packageId = watch('packageId');
  const paymentId = watch('paymentId');

  useEffect(() => {
    setSelectPackage(packagesOption.find((pkg) => pkg.id === packageId));
  }, [packageId, packagesOption]);

  useEffect(() => {
    setSelectPayment(paymentOption.find((pay) => pay.id === paymentId));
  }, [paymentId]);

  useEffect(() => {
    if (routeParams.id && routeParams.type) {
      dispatch(newActivation());
    } else {
      navigate(`/packages/pricing`);
    }
  }, [dispatch, location, navigate, routeParams.id, routeParams.type]);

  useEffect(() => {
    reset({
      ...activation,
      packageId: routeParams.id,
      paymentId: paymentOption.find((pay) => pay.option === routeParams.type).id,
    });
  }, [activation, reset, routeParams.id, routeParams.type]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    dispatch(
      addActivation({
        referenceNo: `${Date.now()}`,
        description: data.description,
        createdBy: { id: user.id },
        packageId: data.packageId,
        paymentType: selectPayment ? selectPayment.type : paymentOption[0].type,
        paymentOption: selectPayment ? selectPayment.option : paymentOption[0].option,
      })
    ).then(({ payload }) => {
      navigate(`/packages/${payload.id}`);
    });
  }

  if (_.isEmpty(form) || !activation) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48 mt-48">
        <TextField
          className="mt-32"
          label="Owner"
          placeholder="Owner"
          id="owner"
          variant="outlined"
          value={user && user.data && user.data.display}
          disabled
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Description"
              placeholder="Description"
              id="description"
              error={!!errors.description}
              helperText={errors?.description?.message}
              variant="outlined"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:document-text</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="packageId"
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-32" required>
              <InputLabel>Package</InputLabel>
              <Select
                {...field}
                label="Package"
                id="packageId"
                error={!!errors.packageId}
                helperText={errors?.packageId?.message}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-outline:clipboard-list</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              >
                {packagesOption.map((option, index) => {
                  return (
                    <MenuItem key={index} value={option.id}>
                      {`${option.name} (${
                        option.organizationLimit === 0 ? 'Unlimited' : option.organizationLimit
                      } organization, ${
                        option.userLimit === 0 ? 'Unlimited' : option.userLimit
                      } user, ${
                        option.messageLimit === 0 ? 'Unlimited' : option.messageLimit
                      } message, ${
                        option.channelLimit === 0 ? 'Unlimited' : option.channelLimit
                      } channel)`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="paymentId"
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-32" required>
              <InputLabel>Payment</InputLabel>
              <Select
                {...field}
                label="Payment"
                id="paymentId"
                error={!!errors.paymentId}
                helperText={errors?.paymentId?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-outline:currency-dollar</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              >
                {paymentOption.map((option, index) => {
                  return (
                    <MenuItem key={index} value={option.id}>
                      {`${option.label}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        />

        {selectPackage && (
          <div className="flex flex-row mt-16 justify-evenly w-full">
            {selectPayment && (
              <div className="flex items-center">
                <div className="flex items-baseline whitespace-nowrap">
                  <Typography className="mr-8 text-2xl">THB</Typography>
                  <Typography className="text-6xl font-semibold leading-tight tracking-tight">
                    {selectPayment.option === 'yearly' && `${selectPackage.yearlyPrice}`}
                    {selectPayment.option === 'quarterly' && `${selectPackage.quarterlyPrice}`}
                    {selectPayment.option === 'halfYearly' && `${selectPackage.halfYearlyPrice}`}
                    {selectPayment.option === 'monthly' && `${selectPackage.monthlyPrice}`}
                  </Typography>
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <Typography className="font-semibold">
                {selectPackage.name} package features, including:
              </Typography>
              <div className="mt-16 space-y-8">
                {selectPackage && selectPackage.organizationLimit && (
                  <div className="flex">
                    <FuseSvgIcon className="text-green-600" size={20}>
                      heroicons-solid:check
                    </FuseSvgIcon>
                    <Typography className="ml-2 leading-5">
                      <b>{selectPackage.organizationLimit}</b> organizations
                    </Typography>
                  </div>
                )}
                {selectPackage && selectPackage.organizationLimit && (
                  <div className="flex">
                    <FuseSvgIcon className="text-green-600" size={20}>
                      heroicons-solid:check
                    </FuseSvgIcon>
                    <Typography className="ml-2 leading-5">
                      <b>{selectPackage.userLimit}</b> users
                    </Typography>
                  </div>
                )}
                {selectPackage && selectPackage.organizationLimit && (
                  <div className="flex">
                    <FuseSvgIcon className="text-green-600" size={20}>
                      heroicons-solid:check
                    </FuseSvgIcon>
                    <Typography className="ml-2 leading-5">
                      <b>{selectPackage.messageLimit}</b> messages
                    </Typography>
                  </div>
                )}
                {selectPackage && selectPackage.organizationLimit && (
                  <div className="flex">
                    <FuseSvgIcon className="text-green-600" size={20}>
                      heroicons-solid:check
                    </FuseSvgIcon>
                    <Typography className="ml-2 leading-5">
                      <b>{selectPackage.channelLimit}</b> channels
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
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

export default NewPackageForm;
