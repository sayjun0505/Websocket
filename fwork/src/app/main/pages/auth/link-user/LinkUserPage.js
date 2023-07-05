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
import { useEffect, useState } from 'react';

import { ContactChannelAvatar } from 'app/shared-components/chat';
import history from '@history';
import { auth } from '../../../../auth/services/firebaseService/firebaseApp';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  email: yup.string().email('You must enter a valid email').required('You must enter a email'),
  password: yup
    .string()
    .required('Please enter your password.')
    .min(8, 'Password is too short - should be 8 chars minimum.'),
  passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const defaultValues = {
  email: '',
  password: '',
  passwordConfirm: '',
};

const LinkUserPage = () => {
  const [facebookUser, setFacebookUser] = useState(null);

  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors, setError } = formState;

  useEffect(() => {
    // console.log('👉☣️ LinkUserPage ', auth.currentUser);
    if (auth.currentUser.providerData) {
      auth.currentUser.providerData.forEach((element) => {
        if (element.providerId === 'facebook.com') {
          // console.log('[Facebook User] ', element);
          console.log('👉☣️ facebookUser ', element);
          setFacebookUser(element);
          reset({
            email: element.email,
            password: '',
            passwordConfirm: '',
          });
        }
      });
    }
  }, [reset]);

  useEffect(() => {
    if (facebookUser && auth.currentUser.providerData.length >= 2) {
      history.push('/');
    }
  }, [facebookUser]);

  function onSubmit({ email, password }) {
    firebaseAuthService
      .linkFacebookUserToEmailUser(email, password)
      .then((user) => {
        // No need to do anything, user data will be set at app/auth/AuthContext
      })
      .catch((_errors) => {
        const errorMessage = _errors.message;
        if (errorMessage === 'User not found.') {
          setError('email', {
            type: 'manual',
            message: errorMessage,
          });
        }
        if (errorMessage === 'Wrong password.') {
          setError('password', {
            type: 'manual',
            message: errorMessage,
          });
        }
      });
  }

  const handleBackToSignIn = () => {
    firebaseAuthService.logOut();
  };

  if (!facebookUser) {
    return null;
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
            Create account
          </Typography>
          <div className="flex items-baseline mt-2 font-medium">
            <Typography>Return to </Typography>
            <Link className="ml-4" to="/sign-in" onClick={firebaseAuthService.logOut}>
              Sign in
            </Link>
          </div>
          <Paper
            className="flex flex-col items-baseline mt-24 font-medium p-16 rounded-1 "
            variant="outlined"
          >
            <div className="flex flex-row space-x-16 items-center w-full">
              <ContactChannelAvatar
                contact={{
                  pictureURL: facebookUser.photoURL || '',
                  display: facebookUser.displayName || '',
                }}
                channel={{ channel: 'facebook' }}
              />
              <div className="flex flex-col space-y-6">
                <Typography variant="subtitle1">{`${facebookUser.displayName || ''}`}</Typography>
                <Typography variant="subtitle2">{facebookUser.email || ''}</Typography>
              </div>
            </div>
            {/* <Button
              variant="contained"
              color="secondary"
              className=" w-full mt-16"
              aria-label="Sign out"
              type="submit"
              size="medium"
              onClick={firebaseAuthService.logOut}
            >
              Sign out
            </Button> */}
          </Paper>

          {/* <div className="flex items-center mt-32">
            <div className="flex-auto mt-px border-t" />
            <Typography className="mx-8" color="text.secondary">
              Link user with Email Password
            </Typography>
            <div className="flex-auto mt-px border-t" />
          </div> */}

          <form
            name="loginForm"
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
                  autoFocus
                  type="email"
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  variant="outlined"
                  disabled
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

            {/* <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between">
              <Link className="text-md font-medium" to="/forgot-password">
                Forgot password?
              </Link>
            </div> */}

            <Button
              variant="contained"
              color="secondary"
              className=" w-full mt-16"
              aria-label="Sign in"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
              size="large"
            >
              Create account
            </Button>
          </form>
        </div>
      </Paper>
    </div>
  );
};

export default LinkUserPage;
