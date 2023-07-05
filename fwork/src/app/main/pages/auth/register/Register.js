import { motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import _ from '@lodash';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerWithFirebase } from 'app/auth/store/registerSlice';

import TermsConditionsDialog from './TermsConditionsDialog';
import PrivacyPolicyDialog from './PrivacyPolicyDialog';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  firstname: yup.string().required('You must enter your firstname'),
  lastname: yup.string().required('You must enter your lastname'),
  email: yup.string().email('You must enter a valid email').required('You must enter a email'),
  password: yup
    .string()
    .required('Please enter your password.')
    .min(8, 'Password is too short - should be 8 chars minimum.'),
  passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  acceptTermsConditions: yup.boolean().oneOf([true], 'The terms and conditions must be accepted.'),
  acceptPrivacyPolicy: yup.boolean().oneOf([true], 'The privacy policy must be accepted.'),
});

const defaultValues = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  inviteCode: '',
  acceptTermsConditions: false,
  acceptPrivacyPolicy: false,
};

function Register(props) {
  const dispatch = useDispatch();
  const authRegister = useSelector(({ auth }) => auth.register);

  const [openTermsConditions, setOpenTermsConditions] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [code, setCode] = useState(null);

  const { control, formState, handleSubmit, reset, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    authRegister.errors.forEach((error) => {
      setError(error.type, {
        type: 'manual',
        message: error.message,
      });
    });
  }, [authRegister.errors, setError]);

  useEffect(() => {
    const { search } = props.location; // could be '?foo=bar'
    const params = new URLSearchParams(search);
    const inviteCode = params.get('code'); // bar
    setCode(inviteCode);
    if (inviteCode) {
      reset({
        inviteCode,
      });
    }
  }, []);

  const handleClickOpenPrivacyPolicy = () => {
    setOpenPrivacyPolicy(true);
    setOpenTermsConditions(false);
  };
  const handleClickOpenTermsConditions = () => {
    setOpenTermsConditions(true);
    setOpenPrivacyPolicy(false);
  };

  const handleClose = () => {
    setOpenPrivacyPolicy(false);
    setOpenTermsConditions(false);
  };

  function onSubmit(model) {
    dispatch(registerWithFirebase(model));
    reset(defaultValues);
  }

  return (
    <div className="flex flex-col flex-auto p-16 sm:p-24 md:flex-row md:p-0 overflow-hidden">
      <div className="flex flex-col flex-grow-0 items-center  p-16 text-center md:p-128 md:items-start md:flex-shrink-0 md:flex-1 md:text-left">
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}>
          <img
            className="w-128 mb-32"
            src={`${process.env.PUBLIC_URL}/assets/images/logos/FoxConnect_icon_512.png`}
            alt="logo"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
          <Typography className="text-32 sm:text-44 font-semibold leading-tight">
            Welcome <br />
            to the <br /> FoxConnect!
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}>
          {/* <Typography variant="subtitle1" className="mt-32 font-medium">
            Powerful and professional admin template for Web Applications, CRM,
            CMS, Admin Panels and more.
          </Typography> */}
        </motion.div>
      </div>

      <Card
        component={motion.div}
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ bounceDamping: 0 }}
        className="w-full max-w-400 mx-auto m-16 md:m-0 rounded-20 md:rounded-none"
        square
        layout
      >
        <CardContent className="flex flex-col items-center justify-center p-16 sm:p-32 md:p-48 md:pt-128 ">
          <Typography variant="h6" className="mb-24 font-semibold text-18 sm:text-24">
            Create an account
          </Typography>

          <form
            name="registerForm"
            noValidate
            className="flex flex-col justify-center w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="firstname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Firstname"
                  autoFocus
                  type="firstname"
                  error={!!errors.firstname}
                  helperText={errors?.firstname?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="lastname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Lastname"
                  autoFocus
                  error={!!errors.lastname}
                  helperText={errors?.lastname?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="display"
              control={control}
              render={({ field }) => (
                <TextField {...field} className="mb-16" label="display" variant="outlined" fullWidth />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors?.password?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="passwordConfirm"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Password (Confirm)"
                  type="password"
                  error={!!errors.passwordConfirm}
                  helperText={errors?.passwordConfirm?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="inviteCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-16"
                  label="Invite Code"
                  variant="outlined"
                  disabled={code !== null}
                  fullWidth
                />
              )}
            />

            <div className="flex flex-col justify-start w-full">
              <Controller
                name="acceptTermsConditions"
                control={control}
                render={({ field }) => (
                  <FormControl className="items-center" error={!!errors.acceptTermsConditions}>
                    <div className="flex flex-row w-full justify-items-start  items-center">
                      <Checkbox {...field} />
                      <Typography variant="caption" className="mr-8">
                        I read and accept
                      </Typography>

                      <a
                        href="/register"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClickOpenTermsConditions();
                        }}
                      >
                        terms and conditions
                      </a>
                    </div>

                    <FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
                  </FormControl>
                )}
              />
              <Controller
                name="acceptPrivacyPolicy"
                control={control}
                render={({ field }) => (
                  <FormControl className="items-center" error={!!errors.acceptPrivacyPolicy}>
                    <div className="flex flex-row w-full justify-items-start items-center">
                      <Checkbox {...field} />
                      <Typography variant="caption" className="mr-8">
                        I read and accept
                      </Typography>

                      <a
                        href="/register"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClickOpenPrivacyPolicy();
                        }}
                      >
                        privacy policy
                      </a>
                    </div>

                    <FormHelperText>{errors?.acceptPrivacyPolicy?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </div>

            <Button
              variant="contained"
              color="primary"
              className="w-full mx-auto mt-16"
              aria-label="Register"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
            >
              Create an account
            </Button>
          </form>

          <div className="flex flex-col items-center justify-center pt-32 pb-24">
            <span className="font-normal">Already have an account?</span>
            <Link className="font-normal" to="/login">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>

      <TermsConditionsDialog open={openTermsConditions} handleClose={handleClose} />
      <PrivacyPolicyDialog open={openPrivacyPolicy} handleClose={handleClose} />
    </div>
  );
}

export default Register;
