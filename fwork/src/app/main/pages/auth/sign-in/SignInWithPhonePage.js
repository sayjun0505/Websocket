import { useState } from 'react';
// import Checkbox from '@mui/material/Checkbox';
// import FormControl from '@mui/material/FormControl';
// import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import history from '@history';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../../../auth/services/firebaseService/firebaseApp';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

const SignInWithPhonePage = () => {
  const [phoneNumber, setPhoneNumber] = useState();
  const [step, setStep] = useState(1);

  const [otp, setOTP] = useState('');
  const [showBotVerify, setShowBotVerify] = useState(false);
  const [final, setFinal] = useState('');

  // Sent OTP
  function onSendOTP() {
    // console.log('Number ', phoneNumber);
    const verify = new RecaptchaVerifier('recaptcha-container', {}, auth);

    setShowBotVerify(true);
    setStep(2);
    firebaseAuthService
      .signInWithPhoneNumber(phoneNumber, verify)
      .then((result) => {
        setShowBotVerify(false);
        setFinal(result);
      })
      .catch((_errors) => {
        // console.error('[SignIn error] ', _errors);
      });
  }
  function onValidate() {
    // console.log('otp ', otp);
    firebaseAuthService
      .validateOtp(otp, final)
      .then((user) => {
        // No need to do anything, user data will be set at app/auth/AuthContext
      })
      .catch((_errors) => {
        // console.error('[SignIn error] ', _errors);
      });
  }

  return (
    <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-auto min-w-0">
      <Box
        className="relative hidden md:flex flex-auto items-center justify-center h-full p-64 lg:px-112 overflow-hidden "
        sx={{ backgroundColor: 'primary.main' }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 960 540"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Box
            component="g"
            sx={{ color: 'primary.light' }}
            className="opacity-20"
            fill="none"
            stroke="currentColor"
            strokeWidth="100"
          >
            <circle r="234" cx="196" cy="23" />
            <circle r="234" cx="790" cy="491" />
          </Box>
        </svg>
        <Box
          component="svg"
          className="absolute -top-64 -right-64 opacity-20"
          sx={{ color: 'primary.light' }}
          viewBox="0 0 220 192"
          width="220px"
          height="192px"
          fill="none"
        >
          <defs>
            <pattern
              id="837c3e70-6c3a-44e6-8854-cc48c737b659"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="4" height="4" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="220" height="192" fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
        </Box>

        <div className="z-10 relative w-full max-w-2xl">
          <div className="text-7xl font-bold leading-none text-gray-100">
            <div>Welcome to</div>
            <div>FoxConnect!</div>
          </div>
        </div>
      </Box>

      <Paper className="h-full sm:h-auto md:flex w-full sm:w-auto md:h-full py-32 px-16 sm:p-48 md:p-64 md:pt-96 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none rtl:border-r-1 ltr:border-l-1">
        <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
          <img className="w-48" src="assets/images/logo/logo.svg" alt="logo" />

          <Typography className="mt-32 text-4xl font-extrabold tracking-tight leading-tight">
            Sign in with Phone number
          </Typography>

          <div className="flex flex-col items-center justify-center w-full mt-32">
            {step === 1 && (
              <>
                <div>
                  <PhoneInput
                    placeholder="Phone number"
                    specialLabel="Phone number"
                    country="th"
                    onlyCountries={['th']}
                    value={phoneNumber}
                    onChange={setPhoneNumber} // passed function receives the phone value
                    inputProps={{
                      name: 'phone',
                      required: true,
                      autoFocus: true,
                    }}
                  />
                </div>
                <Button
                  variant="contained"
                  color="secondary"
                  className=" w-full mt-16"
                  aria-label="Send OTP"
                  type="submit"
                  size="large"
                  onClick={onSendOTP}
                >
                  Send OTP
                </Button>
              </>
            )}
            <div
              style={{
                display: showBotVerify ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              <div id="recaptcha-container" />
            </div>

            {step === 2 && !showBotVerify && (
              <>
                <div className="w-full">
                  <TextField
                    className="w-full"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    placeholder="Enter your OTP"
                    onChange={(e) => {
                      setOTP(e.target.value);
                    }}
                  />
                </div>
                <Button
                  variant="contained"
                  color="secondary"
                  className=" w-full mt-16"
                  aria-label="Verify OTP"
                  size="large"
                  onClick={onValidate}
                >
                  Verify OTP
                </Button>
              </>
            )}

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
                  firebaseAuthService.signInWithSocialMedia();
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
                  history.push('/sign-in');
                }}
              >
                <FuseSvgIcon size={20} color="action">
                  heroicons-outline:mail
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
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default SignInWithPhonePage;
