import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';
import { auth } from '../../../../auth/services/firebaseService/firebaseApp';
import { useOrganization } from '../../../../organization/OrganizationContext';

const SignOutPage = () => {
  const navigate = useNavigate();
  const { setSelectOrganization } = useOrganization();
  const [timeLeft, setTimeLeft] = useState(2);

  useEffect(() => {
    if (!auth || !auth.currentUser) {
      // navigate('/sign-in');
      return;
    }
    auth.currentUser.getIdTokenResult().then((result) => {
      axios.put(
        `/api/notification/setting`,
        { setting: { token: '' } },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
          },
        }
      );
    });
    // .catch(() => {
    //   navigate('/sign-in');
    // });

    setTimeout(() => {
      setSelectOrganization();
      firebaseAuthService.logOut();
      navigate('/sign-in');
    }, 1500);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeLeft(null);
    }
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(intervalId);
    };
  }, [timeLeft]);

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

      <Paper className="h-full sm:h-auto md:flex w-full sm:w-auto md:h-full py-32 px-16 sm:p-48 md:p-64 md:pt-96 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none rtl:border-r-1 ltr:border-l-1 items-center">
        <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
          <img className="w-160 mx-auto" src="assets/images/logo/FoxConnect_logo.png" alt="logo" />

          <Typography className="mt-32 text-4xl font-extrabold tracking-tight leading-tight text-center">
            You have signed out!
          </Typography>
          <Typography className="flex justify-center mt-2 font-medium">
            Redirecting in {timeLeft} seconds
          </Typography>

          <Typography className="mt-32 text-md font-medium text-center" color="text.secondary">
            <span>Go to</span>
            <Link className="ml-4" to="/sign-in">
              sign in
            </Link>
          </Typography>
        </div>
      </Paper>
    </div>

    // <div className="flex flex-col flex-auto items-center sm:justify-center min-w-0">
    //   <Paper className="flex items-center w-full sm:w-auto min-h-full sm:min-h-auto rounded-0 py-32 px-16 sm:p-48 sm:rounded-2xl sm:shadow">
    //     <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
    //       <img className="w-48 mx-auto" src="assets/images/logo/logo.svg" alt="logo" />

    //       <Typography className="mt-32 text-4xl font-extrabold tracking-tight leading-tight text-center">
    //         You have signed out!
    //       </Typography>
    //       <Typography className="flex justify-center mt-2 font-medium">
    //         Redirecting in {timeLeft} seconds
    //       </Typography>

    //       <Typography className="mt-32 text-md font-medium text-center" color="text.secondary">
    //         <span>Go to</span>
    //         <Link className="ml-4" to="/sign-in">
    //           sign in
    //         </Link>
    //       </Typography>
    //     </div>
    //   </Paper>
    // </div>
  );
};

export default SignOutPage;
