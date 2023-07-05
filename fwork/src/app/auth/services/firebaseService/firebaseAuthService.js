/* eslint-disable class-methods-use-this */
/* eslint import/no-extraneous-dependencies: off */
import axios from 'axios';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  FacebookAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import FuseUtils from '@fuse/utils/FuseUtils';
import themesConfig from 'app/configs/themesConfig';
import i18n from '../../../../i18n';
import { auth, providers } from './firebaseApp';

class FirebaseAuthService extends FuseUtils.EventEmitter {
  init() {
    this.handleAuthentication();
  }

  handleAuthentication = async () => {
    // console.log('👉👽 handleAuthentication ');

    // Set callback function when firebase refresh Token
    auth.onIdTokenChanged((user) => {
      // console.log('👉👽 handleAuthentication ', user);
      if (user) {
        // User is signed in or token was refreshed.
        user.getIdToken().then((accessToken) => {
          this.setSession(accessToken);
          this.emit('onAutoLogin', user);
        });
      } else {
        this.emit('onNoAccessToken');
      }
    });
  };

  // Firebase Login

  signInWithEmailAndPassword = ({ email, password }) => {
    // console.log('👉👽 signInWithEmailAndPassword', email);
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((response) => {
          // this.setSession(this.getAccessToken());
          resolve(response.user);
          // this.emit('onLogin', response.user);
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
            // console.error('👉 ❌', error.message);
            reject(new Error('User not found.'));
          }

          if (passwordErrorCodes.includes(error.code)) {
            // console.error('👉 ❌', error.message);
            reject(new Error('Wrong password.'));
          }

          if (error.code === 'auth/invalid-api-key') {
            // console.error('👉 ❌', error.message);
            reject(new Error('something wrong.'));
          }
          // console.error('👉 ❌', error);
          reject(new Error('something wrong.'));
        });
    });
  };

  signInWithFacebook = () => {
    console.log('👉👽 signInWithFacebook');
    const facebookProvider = providers.facebook;
    facebookProvider.addScope('email');
    return new Promise((resolve, reject) => {
      this.signInWithSocialMedia(facebookProvider)
        .then((result) => {
          resolve(result.user);
          this.emit('onLogin', result.user);
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
            // console.error('👉 ❌', error.message);
            reject(new Error('User not found.'));
          }
          // console.error('👉 ❌', error);
          reject(new Error('something wrong.'));
        });
    });
  };

  signInWithPhoneNumber = (phoneNumber, verify) => {
    // console.log('👉👽 signInWithPhoneNumber', phoneNumber);
    return new Promise((resolve, reject) => {
      if (!phoneNumber || phoneNumber === '' || (phoneNumber && phoneNumber.length < 10))
        reject(new Error('phone number wrong.'));

      signInWithPhoneNumber(auth, `+${phoneNumber}`, verify)
        .then((result) => {
          resolve(result);
          // this.emit('onLogin', result.user);
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
          // this.setSession(this.getAccessToken());
          resolve(result.user);
          this.emit('onLogin', result.user);
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
            // console.error('👉 ❌', error.message);
            reject(new Error('User not found.'));
          }
          // console.error('👉 ❌', error);
          reject(new Error('something wrong.'));
        });
    });
  };

  linkFacebookUserToEmailUser = (email, password) => {
    // console.log('👉👽 linkFacebookUserToEmailUser', email, password);
    const facebookProvider = new FacebookAuthProvider();
    const emailProvider = new EmailAuthProvider();

    const { currentUser } = auth;
    // reauthenticateWithPopup(currentUser, facebookProvider);
    const credential = EmailAuthProvider.credential(email, password);
    return new Promise((resolve, reject) => {
      linkWithCredential(currentUser, credential)
        .then((usercred) => {
          const { user } = usercred;
          // console.log('Account linking success', user);
          this.emit('onLinkUser', true);
          resolve(user);
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
            // console.error('👉 ❌', error.message);
            reject(new Error('User not found.'));
          }
          // console.error('👉 ❌', error);
          reject(new Error('something wrong.'));
        });
    });
  };

  // Firebase Sign Up

  registerWithFirebase = ({ email, password }) => {
    // console.log('👉👽 registerWithFirebase ');
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(auth, email, password)
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
            // console.error('👉 ❌ [register] ', error.message);
            reject(new Error('You can not use this Username.'));
          }

          if (emailErrorCodes.includes(error.code)) {
            // console.error('👉 ❌ [register] ', error.message);
            reject(new Error('This email is already use.'));
          }

          if (passwordErrorCodes.includes(error.code)) {
            // console.error('👉 ❌ [register] ', error.message);
            reject(new Error('Weak password.'));
          }
          // console.error('👉 ❌[Firebase] register error: ', error);
          reject(new Error('Something wrong'));
        });
    });
  };

  forgetPassword = ({ email }) => {
    // console.log('👉👽 forgetPassword', email);
    return new Promise((resolve, reject) => {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          const usernameErrorCodes = ['auth/user-not-found', 'auth/user-disabled'];
          const emailErrorCodes = ['auth/email-already-in-use', 'auth/invalid-email'];

          if (usernameErrorCodes.includes(error.code)) {
            // console.error('👉 ❌', error.message);
            reject(new Error('Username not found.'));
          }

          if (emailErrorCodes.includes(error.code)) {
            // console.error('👉 ❌', error.message);
            reject(new Error('This email address is not valid.'));
          }

          // console.error('👉 ❌', error);
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

  // getFoxUserData = () => {
  //   console.log('👉👽 getFoxUserData ');
  //   return new Promise((resolve, reject) => {
  //     // console.log('[Firebase] Get Fox User data.');
  //     firebase
  //       .auth()
  //       .currentUser.getIdTokenResult()
  //       .then(({ token }) => {
  //         axios
  //           .get(`/api/user/me`, {
  //             headers: {
  //               'Content-Type': 'application/json',
  //               Authorization: `Bearer ${token}`,
  //             },
  //           })
  //           .then((response) => {
  //             if (response.data) {
  //               const theme =
  //                 response.data && response.data.theme === 'dark'
  //                   ? {
  //                       main: themesConfig.defaultDark,
  //                       navbar: themesConfig.defaultDark,
  //                       toolbar: themesConfig.defaultDark,
  //                       footer: themesConfig.defaultDark,
  //                     }
  //                   : {
  //                       main: themesConfig.default,
  //                       navbar: themesConfig.defaultDark,
  //                       toolbar: themesConfig.default,
  //                       footer: themesConfig.default,
  //                     };
  //               resolve({
  //                 role: 'user',
  //                 uuid: response.data.id,
  //                 form: 'custom-db',
  //                 theme: response.data.theme,
  //                 data: {
  //                   display: response.data.display,
  //                   pictureURL: response.data.pictureURL
  //                     ? response.data.pictureURL
  //                     : response.data.picture,
  //                   facebookToken: response.data.facebookToken,
  //                   language: response.data.language,
  //                   email: response.data.email,
  //                   isOnline: response.data.isOnline,
  //                   settings: {
  //                     layout: {
  //                       style: 'layout1', // layout1 layout2 layout3
  //                       config: {}, // checkout default layout configs at app/theme-layouts for example  app/theme-layouts/layout1/Layout1Config.js
  //                     },
  //                     customScrollbars: false,
  //                     direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
  //                     theme,
  //                     defaultAuth: null,
  //                     loginRedirectUrl: '/',
  //                   },
  //                 },
  //                 // foxData: {
  //                 //   ...response.data,
  //                 // },
  //               });
  //               // resolve({
  //               //   role: 'user',
  //               //   data: response.data,
  //               // });
  //             } else {
  //               this.logout();
  //               reject(new Error('Failed to get Fox user data.'));
  //             }
  //           })
  //           .catch((error) => {
  //             reject(new Error('Failed to get Fox user data.'));
  //             this.logOut();
  //           });
  //       });
  //   });
  // };

  logOut = () => {
    if (!auth) {
      return;
    }
    signOut(auth);
    this.setSession(null);
    this.emit('onLogout', 'Logged out');
  };

  /**
   * Util
   */

  setSession = (accessToken) => {
    // console.log('👉👽 setSession ');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('access_token_date', new Date());
      // console.log('[TOKEN] Set headers Auth ', accessToken);
      // axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_token_date');
      // console.log('[TOKEN] Delete headers Auth ', accessToken);
      // delete axios.defaults.headers.common.Authorization;
    }
  };

  getAccessToken = async () => {
    // console.log('👉👽 getAccessToken');
    const { token } = await auth.currentUser.getIdTokenResult();
    return token;
  };

  signInWithSocialMedia = (provider) => {
    return new Promise((resolve, reject) => {
      signInWithPopup(auth, provider)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  };

  getFoxUserData = () => {
    // console.log('👉👽 getFoxUserData ');
    return new Promise((resolve, reject) => {
      this.getAccessToken().then((token) => {
        axios
          .get(`/api/user/me`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            // console.log('👉👽 getFoxUserData', response.data);
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
      // firebase
      //   .auth()
      //   .currentUser.getIdTokenResult()
      //   .then(({ token }) => {
      //     axios
      //       .get(`/api/user/me`, {
      //         headers: {
      //           'Content-Type': 'application/json',
      //           Authorization: `Bearer ${token}`,
      //         },
      //       })
      //       .then((response) => {
      //         if (response.data) {
      //           const theme =
      //             response.data && response.data.theme === 'dark'
      //               ? {
      //                   main: themesConfig.defaultDark,
      //                   navbar: themesConfig.defaultDark,
      //                   toolbar: themesConfig.defaultDark,
      //                   footer: themesConfig.defaultDark,
      //                 }
      //               : {
      //                   main: themesConfig.default,
      //                   navbar: themesConfig.defaultDark,
      //                   toolbar: themesConfig.default,
      //                   footer: themesConfig.default,
      //                 };
      //           resolve({
      //             role: 'user',
      //             uuid: response.data.id,
      //             form: 'custom-db',
      //             theme: response.data.theme,
      //             data: {
      //               display: response.data.display,
      //               pictureURL: response.data.pictureURL
      //                 ? response.data.pictureURL
      //                 : response.data.picture,
      //               facebookToken: response.data.facebookToken,
      //               language: response.data.language,
      //               email: response.data.email,
      //               isOnline: response.data.isOnline,
      //               settings: {
      //                 layout: {
      //                   style: 'layout1', // layout1 layout2 layout3
      //                   config: {}, // checkout default layout configs at app/theme-layouts for example  app/theme-layouts/layout1/Layout1Config.js
      //                 },
      //                 customScrollbars: false,
      //                 direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
      //                 theme,
      //                 defaultAuth: null,
      //                 loginRedirectUrl: '/',
      //               },
      //             },
      //             // foxData: {
      //             //   ...response.data,
      //             // },
      //           });
      //           // resolve({
      //           //   role: 'user',
      //           //   data: response.data,
      //           // });
      //         } else {
      //           this.logout();
      //           reject(new Error('Failed to get Fox user data.'));
      //         }
      //       })
      //       .catch((error) => {
      //         reject(new Error('Failed to get Fox user data.'));
      //         this.logOut();
      //       });
      //   });
    });
  };
}

const instance = new FirebaseAuthService();

export default instance;
