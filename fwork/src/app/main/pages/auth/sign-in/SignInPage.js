import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
// import FormControl from '@mui/material/FormControl';
// import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import history from '@history';

// import { submitLoginWithFireBase } from 'app/auth/store/loginSlice';
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
});

const defaultValues = {
  email: '',
  password: '',
  // remember: true,
};

const SignInPage = () => {
  // const dispatch = useDispatch();
  // const login = useSelector(({ auth }) => auth.login);

  const { control, formState, handleSubmit, reset, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  function onSubmit({ email, password }) {
    firebaseAuthService
      .signInWithEmailAndPassword({ email, password })
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
            Sign in
          </Typography>
          <div className="flex items-baseline mt-2 font-medium">
            <Typography>Don't have an account?</Typography>
            <Link className="ml-4" to="/sign-up">
              Sign up
            </Link>
          </div>

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
                  className="mb-24"
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

            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between">
              {/* <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormControlLabel
                      label="Remember me"
                      control={<Checkbox size="small" {...field} />}
                    />
                  </FormControl>
                )}
              /> */}

              <Link className="text-md font-medium" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <Button
              variant="contained"
              color="secondary"
              className=" w-full mt-16"
              aria-label="Sign in"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
              size="large"
            >
              Sign in
            </Button>

            <div className="flex items-center mt-32">
              <div className="flex-auto mt-px border-t" />
              <Typography className="mx-8" color="text.secondary">
                Or continue with
              </Typography>
              <div className="flex-auto mt-px border-t" />
            </div>

            <div className="flex flex-col w-full items-center mt-32 space-y-8">
              <Button
                variant="outlined"
                className="flex-auto w-full"
                onClick={() => {
                  firebaseAuthService.signInWithFacebook();
                }}
              >
                <FuseSvgIcon size={20} color="action">
                  feather:facebook
                </FuseSvgIcon>
              </Button>
              <Button
                variant="outlined"
                className="flex-auto w-full"
                onClick={() => {
                  history.push('/sign-in-phone');
                }}
              >
                <FuseSvgIcon size={20} color="action">
                  heroicons-outline:phone
                </FuseSvgIcon>
              </Button>
              {/* <Button variant="outlined" className="flex-auto">
                <FuseSvgIcon size={20} color="action">
                  feather:twitter
                </FuseSvgIcon>
              </Button>
              <Button variant="outlined" className="flex-auto">
                <FuseSvgIcon size={20} color="action">
                  feather:github
                </FuseSvgIcon>
              </Button> */}
            </div>
          </form>
        </div>
      </Paper>
    </div>
  );
};

export default SignInPage;
