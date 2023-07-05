import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import { showMessage } from 'app/store/fuse/messageSlice';
import { logoutUser, setUser } from 'app/store/userSlice';
import { changeLanguage } from 'app/store/i18nSlice';
import history from '@history';

// import themesConfig from 'app/configs/themesConfig';
// import { changeFuseTheme } from 'app/store/fuse/settingsSlice';
import firebaseAuthService from './services/firebaseService/firebaseAuthService';

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [waitAuthCheck, setWaitAuthCheck] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    firebaseAuthService.on('onAutoLogin', (firebaseUser) => {
      // console.log('👉👻 onAutoLogin ', firebaseUser);
      if (window.location.pathname === '/sign-out') {
        pass();
      }

      if (
        firebaseUser &&
        firebaseUser.providerData &&
        firebaseUser.providerData.length === 1 &&
        firebaseUser.providerData[0].providerId === 'facebook.com'
      ) {
        // console.log('👉👻 onAutoLogin Facebook Provider ');
        history.push('/link-user');
        pass();
      } else {
        /**
         * Sign in and retrieve user data with stored token
         */
        firebaseAuthService
          .getFoxUserData()
          .then((user) => {
            // console.log('👉👻[AuthProvider] Get Fox User data done. ', user);
            // if (user && user.data) {
            //   setRole('user');
            // }
            // Setup Language
            if (user && user.data && user.data.language) {
              dispatch(changeLanguage(user.data.language));
            } else {
              dispatch(changeLanguage('en'));
            }
            // step2(user, 'Signed in with Firebase');
            // history.push('/sign-in-2');
            // pass();
            success(user, 'Signed in with Firebase');
          })
          .catch((error) => {
            dispatch(logoutUser());
            // pass(error.message);
          });
      }
    });

    firebaseAuthService.on('onLogin', (user) => {
      // console.log('👉👻 onLogin ');
      // console.log('[AuthProvider] onLogin ');
      // success(user, 'Signed in');
    });

    firebaseAuthService.on('onLinkUser', () => {
      // console.log('👉👻 onLinkUser ');
      // console.log('[AuthProvider] onLogin ');
      // success(user, 'Signed in');
    });

    firebaseAuthService.on('onLogout', () => {
      // console.log('👉👻 onLogout ');
      // pass('Signed out');
      dispatch(logoutUser());
    });

    // firebaseService.on('onAutoLogout', (message) => {
    //   pass(message);

    //   dispatch(logoutUser());
    // });

    firebaseAuthService.on('onNoAccessToken', () => {
      // console.log('👉👻 onNoAccessToken ');
      // console.log('[Location] ', window.location.pathname);
      if (
        window.location.pathname !== '/sign-in' &&
        window.location.pathname !== '/sign-in-2' &&
        window.location.pathname !== '/sign-in-phone' &&
        window.location.pathname !== '/sign-up' &&
        window.location.pathname !== '/sign-out' &&
        window.location.pathname !== '/forgot-password'
      )
        history.push('/sign-in');
      pass();
      //   setWaitAuthCheck(false);
      //   setIsAuthenticated(false);
    });

    firebaseAuthService.init();

    function success(user, message) {
      // console.log('👉👻 success ', message, user);
      // if (message) {
      //   dispatch(showMessage({ message }));
      // }

      Promise.all([
        dispatch(setUser(user)),
        // You can receive data in here before app initialization
      ]).then((values) => {
        setWaitAuthCheck(false);
        setIsAuthenticated(true);
      });
    }

    function pass(message) {
      // console.log('👉👻 pass ', message);
      if (message) {
        dispatch(showMessage({ message }));
        /* Setting the state of the app to false. */
      }

      setWaitAuthCheck(false);
      setIsAuthenticated(false);
    }
  }, [dispatch]);

  return waitAuthCheck ? (
    <FuseSplashScreen />
  ) : (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>
  );
};

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
