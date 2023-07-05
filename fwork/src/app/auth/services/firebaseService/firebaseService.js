/* eslint-disable class-methods-use-this */
/* eslint import/no-extraneous-dependencies: off */
import FuseUtils from '@fuse/utils/FuseUtils';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import axios from 'axios';
import themesConfig from 'app/configs/themesConfig';
import i18n from '../../../../i18n';
import 'firebase/compat/messaging';
import 'firebase/compat/database';
import firebaseAuthService from './firebaseAuthService';
import { config, firebaseVapidKey } from './firebaseServiceConfig';

// import { firebaseVapidKey } from './firebaseServiceConfig';

class FirebaseService extends FuseUtils.EventEmitter {
  init() {
    this.initialize();
    this.handleAuthentication();
  }

  initialize = () => {
    // console.log('👉👽 initialize ');
    // console.log('[Firebase] initialize');
    if (Object.entries(config).length === 0 && config.constructor === Object) {
      if (process.env.NODE_ENV === 'development') {
        // console.warn(
        //   'Missing Firebase Configuration at src/app/services/firebaseService/firebaseServiceConfig.js'
        // );
      }
      return;
    }

    if (firebase.apps.length) {
      return;
    }
    firebase.initializeApp(config);
    // this.db = firebase.database();
    this.messaging = firebase.messaging();
    this.auth = firebase.auth();
  };

  handleAuthentication = async () => {
    // console.log('👉👽 handleAuthentication ');
    // console.log('[Firebase] handleAuthentication');
    // const accessToken = this.getAccessToken();
    // Set callback function when firebase refresh Token
    firebase.auth().onIdTokenChanged((user) => {
      // console.log('👉[Firebase] onIdTokenChanged ', user);
      if (user) {
        // User is signed in or token was refreshed.
        user.getIdToken().then((accessToken) => {
          // console.log('[TOKEN] Set headers Auth ', accessToken);
          // console.log('👉[Firebase] onAutoLogin ', user);
          // axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          this.setSession(accessToken);
          this.emit('onAutoLogin', true);
        });
      } else {
        this.emit('onNoAccessToken');
      }
    });
    // console.log('[Firebase] accessToken ', accessToken);
    // if (!accessToken) {
    //   this.emit('onNoAccessToken');
    //   return;
    // }
    // this.setSession(accessToken);
  };

  // Firebase Login

  signInWithEmailAndPassword = ({ email, password }) => {
    // console.log('👉👽 signInWithEmailAndPassword ');
    return new Promise((resolve, reject) => {
      // console.log('[Firebase] Sign In ', email, password);
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          return this.auth
            .signInWithEmailAndPassword(email, password)
            .then((response) => {
              // if (response.user) {
              this.setSession(this.getAccessToken());
              resolve(response.user);
              this.emit('onLogin', response.user);
              // }
            })
            .catch((error) => {
              const emailErrorCodes = [
                'auth/email-already-in-use',
                'auth/invalid-email',
                'auth/operation-not-allowed',
                'auth/user-not-found',
                'auth/user-disabled',
              ];
              const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];
              const response = [];

              if (emailErrorCodes.includes(error.code)) {
                // console.error(error.message);
                reject(new Error('User not found.'));
              }

              if (passwordErrorCodes.includes(error.code)) {
                // console.error(error.message);
                reject(new Error('Wrong password.'));
              }

              if (error.code === 'auth/invalid-api-key') {
                // console.error(error.message);
                reject(new Error('something wrong.'));
              }
              // console.error(error);
              reject(new Error('something wrong.'));
            });
        });
    });
  };

  signInWithSocialMedia = () => {
    // console.log('👉👽 signInWithSocialMedia ');
    const fbProvider = this.Providers.facebook;
    fbProvider.addScope('email');
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          return this.auth
            .signInWithPopup(fbProvider)
            .then((response) => {
              this.setSession(this.getAccessToken());
              resolve(response.user);
              this.emit('onLogin', response.user);
            })
            .catch((error) => {
              const emailErrorCodes = [
                'auth/email-already-in-use',
                'auth/invalid-email',
                'auth/operation-not-allowed',
                'auth/user-not-found',
                'auth/user-disabled',
              ];

              if (emailErrorCodes.includes(error.code)) {
                // console.error(error.message);
                reject(new Error('User not found.'));
              }

              // console.error(error);
              reject(new Error('something wrong.'));
            });
        })
        .catch((error) => {
          const emailErrorCodes = [
            'auth/email-already-in-use',
            'auth/invalid-email',
            'auth/operation-not-allowed',
            'auth/user-not-found',
            'auth/user-disabled',
          ];
          const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];
          const response = [];

          if (emailErrorCodes.includes(error.code)) {
            // console.error(error.message);
            reject(new Error('User not found.'));
          }

          if (passwordErrorCodes.includes(error.code)) {
            // console.error(error.message);
            reject(new Error('Wrong password.'));
          }

          if (error.code === 'auth/invalid-api-key') {
            // console.error(error.message);
            reject(new Error('something wrong.'));
          }
          // console.error(error);
          reject(new Error('something wrong.'));
        });
    });
  };

  signInWithPhoneNumber = (phoneNumber, verify) => {
    // console.log('👉👽 signInWithPhoneNumber ');
    return new Promise((resolve, reject) => {
      // console.log('[signInWithPhoneNumber] ', phoneNumber);
      if (!phoneNumber || phoneNumber === '' || (phoneNumber && phoneNumber.length < 10))
        reject(new Error('phone number wrong.'));

      firebase
        .auth()
        .signInWithPhoneNumber(`+${phoneNumber}`, verify)
        .then((result) => {
          resolve(result);
          // setFinal(result)
          // setShow(true)
          // setShowVerify(false)
        })
        .catch((error) => {
          const emailErrorCodes = [
            'auth/email-already-in-use',
            'auth/invalid-email',
            'auth/operation-not-allowed',
            'auth/user-not-found',
            'auth/user-disabled',
          ];
          const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];
          const response = [];

          if (emailErrorCodes.includes(error.code)) {
            // console.error(error.message);
            reject(new Error('User not found.'));
          }

          if (passwordErrorCodes.includes(error.code)) {
            // console.error(error.message);
            reject(new Error('Wrong password.'));
          }

          if (error.code === 'auth/invalid-api-key') {
            // console.error(error.message);
            reject(new Error('something wrong.'));
          }
          // console.error(error);
          reject(new Error('something wrong.'));
        });
    });
  };

  validateOtp = (otp, final) => {
    return new Promise((resolve, reject) => {
      if (otp === null || final === null) reject(new Error('OTP wrong.'));
      final
        .confirm(otp)
        .then((result) => {
          // success
          this.setSession(this.getAccessToken());
          resolve(result.user);
          this.emit('onLogin', result.user);
        })
        .catch((err) => {
          // console.log(err);
          reject(new Error('something wrong.'));
          window.location.reload();
        });
    });
  };

  // Firebase Sign Up

  registerWithFirebase = ({ email, password, firstname, lastname, display }) => {
    // console.log('👉👽 registerWithFirebase ');
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((response) => {
          resolve();
          //   // this.setSession(this.getAccessToken());
          //   response.user.getIdTokenResult().then(({ token }) => {
          //     this.createUser(
          //       {
          //         ...response.user,
          //         firstname,
          //         lastname,
          //         display,
          //         email,
          //       },
          //       token
          //     )
          //       .then((user) => {
          //         resolve(user);
          //         this.emit('onLogin', user);
          //       })
          //       .catch((error) => {
          //         console.error('[Firebase] register error: ', error);
          //         reject(new Error('Failed to sign up user.'));
          //       });
          //   });
        })
        .catch((error) => {
          const usernameErrorCodes = [
            'auth/operation-not-allowed',
            'auth/user-not-found',
            'auth/user-disabled',
          ];

          const emailErrorCodes = ['auth/email-already-in-use', 'auth/invalid-email'];
          const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];

          if (usernameErrorCodes.includes(error.code)) {
            // console.error('[Firebase] register error: ', error.message);
            reject(new Error('You can not use this Username.'));
          }

          if (emailErrorCodes.includes(error.code)) {
            // console.error('[Firebase] register error: ', error.message);
            reject(new Error('This email is already use.'));
          }

          if (passwordErrorCodes.includes(error.code)) {
            // console.error('[Firebase] register error: ', error.message);
            reject(new Error('Weak password.'));
          }
          // console.error('[Firebase] register error: ', error);
          reject(new Error('Something wrong'));
        });
    });
  };

  forgetPassword = ({ email }) => {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          resolve();

          // return dispatch(sendEmailSuccess());
        })
        .catch((error) => {
          const usernameErrorCodes = ['auth/user-not-found', 'auth/user-disabled'];
          const emailErrorCodes = ['auth/email-already-in-use', 'auth/invalid-email'];

          if (usernameErrorCodes.includes(error.code)) {
            // console.error('[Firebase] register error: ', error.message);
            reject(new Error('Username not found.'));
          }

          if (emailErrorCodes.includes(error.code)) {
            // console.error('[Firebase] register error: ', error.message);
            reject(new Error('This email address is not valid.'));
          }

          // console.error('[Firebase] register error: ', error);
          reject(new Error('Something wrong'));
        });
    });
  };

  // createUser = (user, token) => {
  //   return new Promise((resolve, reject) => {
  //     // const token = await firebaseAuthService.getAccessToken();
  //     // const response = await axios.get(`/api/activation/${id}`, {
  //     // user.getIdTokenResult().then(({ token }) => {
  //     axios
  //       .put(
  //         '/api/user',
  //         { user },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //         // });
  //       )
  //       .then((response) => {
  //         if (response.data) {
  //           this.setSession(response.data.access_token);
  //           resolve({
  //             role: ['user'],
  //             data: response.data,
  //           });
  //         } else {
  //           reject(response.data.error);
  //         }
  //       });
  //     // });
  //   });
  // };
  // Util signIn function

  getFoxUserData = () => {
    // console.log('👉👽 getFoxUserData ');
    return new Promise((resolve, reject) => {
      // console.log('[Firebase] Get Fox User data.');
      firebase
        .auth()
        .currentUser.getIdTokenResult()
        .then(({ token }) => {
          axios
            .get(`/api/user/me`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              if (response.data) {
                const theme =
                  response.data && response.data.theme === 'dark'
                    ? {
                        main: themesConfig.defaultDark,
                        navbar: themesConfig.defaultDark,
                        toolbar: themesConfig.defaultDark,
                        footer: themesConfig.defaultDark,
                      }
                    : {
                        main: themesConfig.default,
                        navbar: themesConfig.defaultDark,
                        toolbar: themesConfig.default,
                        footer: themesConfig.default,
                      };
                resolve({
                  role: 'user',
                  uuid: response.data.id,
                  form: 'custom-db',
                  theme: response.data.theme,
                  data: {
                    display: response.data.display,
                    pictureURL: response.data.pictureURL
                      ? response.data.pictureURL
                      : response.data.picture,
                    facebookToken: response.data.facebookToken,
                    language: response.data.language,
                    email: response.data.email,
                    isOnline: response.data.isOnline,
                    settings: {
                      layout: {
                        style: 'layout1', // layout1 layout2 layout3
                        config: {}, // checkout default layout configs at app/theme-layouts for example  app/theme-layouts/layout1/Layout1Config.js
                      },
                      customScrollbars: false,
                      direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
                      theme,
                      defaultAuth: null,
                      loginRedirectUrl: '/',
                    },
                  },
                  // foxData: {
                  //   ...response.data,
                  // },
                });
                // resolve({
                //   role: 'user',
                //   data: response.data,
                // });
              } else {
                this.logout();
                reject(new Error('Failed to get Fox user data.'));
              }
            })
            .catch((error) => {
              reject(new Error('Failed to get Fox user data.'));
              this.logOut();
            });
        });
    });
  };

  setSession = (accessToken) => {
    // if (accessToken) {
    //   // localStorage.setItem('jwt_access_token', accessToken);
    //   // console.log('[TOKEN] Set headers Auth ', accessToken);
    //   axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // } else {
    //   // localStorage.removeItem('jwt_access_token');
    //   // console.log('[TOKEN] Delete headers Auth ', accessToken);
    //   delete axios.defaults.headers.common.Authorization;
    // }
  };

  getAccessToken = async () => {
    // console.log('👉👽 getAccessToken ');
    // console.log('[Firebase] getAccessToken ', this.auth().currentUser.getIdTokenResult());
    const token = await firebaseAuthService.getAccessToken();
    this.setSession(token);
    return token;
  };

  logOut = () => {
    if (!this.auth) {
      return;
    }
    this.auth.signOut();
    this.emit('onLogout', 'Logged out');
  };

  Providers = {
    facebook: new firebase.auth.FacebookAuthProvider(),
  };

  // getMessagingToken = () => {
  //   if (!firebase.apps.length) {
  //     return false;
  //   }
  //   return new Promise((resolve, reject) => {
  //     this.messaging
  //       .getToken({
  //         vapidKey: firebaseVapidKey,
  //       })
  //       .then((currentToken) => {
  //         if (currentToken) {
  //           console.info('Registration token available.');
  //           resolve(currentToken);
  //         } else {
  //           // Show permission request UI
  //           console.info('No registration token available. Request permission to generate one.');
  //           // ...
  //           resolve();
  //         }
  //       })
  //       .catch((err) => {
  //         console.error('An error occurred while retrieving token. ', err);
  //         reject(err);
  //       });
  //   });
  // };

  getMessagingToken = (setTokenFound) => {
    console.log('👉👽 getMessagingToken ');
    // return this.messaging
    //   .getToken({ vapidKey: firebaseVapidKey })
    //   .then((currentToken) => {
    //     if (currentToken) {
    //       console.log('current token for client: ', currentToken);
    //       // setTokenFound(true);
    //       return currentToken;
    //       // Track the token -> client mapping, by sending to backend server
    //       // show on the UI that permission is secured
    //     }
    //     console.log('No registration token available. Request permission to generate one.');
    //     // setTokenFound(false);
    //     return false;
    //     // shows on the UI that permission is required
    //   })
    //   .catch((err) => {
    //     console.log('An error occurred while retrieving token. ', err);
    //     // catch error while creating client token
    //   });
    return new Promise((resolve, reject) => {
      this.messaging
        .getToken({
          vapidKey: firebaseVapidKey,
        })
        .then((currentToken) => {
          if (currentToken) {
            // console.info('Registration token available.');
            resolve(currentToken);
          } else {
            // Show permission request UI
            // console.info('No registration token available. Request permission to generate one.');
            // ...
            resolve();
          }
        })
        .catch((err) => {
          // console.error('An error occurred while retrieving token. ', err);
          reject(err);
        });
    });
  };

  onMessageListener = () =>
    new Promise((resolve) => {
      this.messaging.onMessage((payload) => {
        // console.log('[onMessageListener] ', payload);
        resolve(payload);
      });
    });
}

const instance = new FirebaseService();

export default instance;
