import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import _ from '@lodash';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { useDispatch } from 'react-redux';
// import { submitForgotWithFireBase } from 'app/auth/store/forgotSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  email: yup.string().email('You must enter a valid email').required('You must enter a email'),
});

const defaultValues = {
  email: '',
};

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { control, formState, handleSubmit, reset, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  function onSubmit(model) {
    // dispatch(submitForgotWithFireBase(model));
    // console.log('[onSubmit] ', model);
    firebaseAuthService
      .forgetPassword(model)
      .then(() => {
        // dispatch(
        //   showMessage({
        //     message: 'Send Email success',
        //     autoHideDuration: 3000,
        //     variant: 'success',
        //   })
        // );
        // console.log('Send Email success');
      })
      .catch((error) => {
        setError('email', { type: 'custom', message: error.message || '' });
        // console.log('Send Email error: ', error.message);
      });
    reset(defaultValues);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-auto min-w-0">
      <Box className="relative hidden md:flex flex-auto items-center justify-center h-full p-64 lg:px-112 overflow-hidden bg-gradient-to-b from-[#2659C7] to-[#06368C]">
        <img
          className="absolute top-0 right-0 h-full"
          src="assets/images/logo/icon-fc.svg"
          alt="logo"
        />
        <div className="z-10 relative w-full text-white">
          <div className="uppercase text-[4rem] font-bold">Welcome to FoxConnect</div>
          <div className="text-[2rem] font-light">
            The only team communication and collaboration platform
          </div>
          <div className="text-[2rem] font-light">your business needs.</div>
        </div>
      </Box>

      <Paper className="h-full sm:h-auto md:flex w-full sm:w-auto md:h-full py-32 px-16 sm:p-48 md:p-64 md:pt-96 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none rtl:border-r-1 ltr:border-l-1">
        <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
          <img className="w-160" src="assets/images/logo/FoxConnect_logo.png" alt="logo" />

          <Typography className="mt-32 text-4xl font-extrabold tracking-tight leading-tight">
            Forgot password?
          </Typography>
          <div className="flex items-baseline mt-2 font-medium">
            <Typography>Fill the form to reset your password</Typography>
          </div>

          <form
            name="registerForm"
            noValidate
            className="flex flex-col justify-center w-full mt-32"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-24"
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

            <Button
              variant="contained"
              color="secondary"
              className=" w-full mt-4"
              aria-label="Register"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
              size="large"
            >
              Send reset link
            </Button>

            <Typography className="mt-32 text-md font-medium" color="text.secondary">
              <span>Return to</span>
              <Link className="ml-4" to="/sign-in">
                sign in
              </Link>
            </Typography>
          </form>
        </div>
      </Paper>
    </div>
  );
};

export default ForgotPassword;
