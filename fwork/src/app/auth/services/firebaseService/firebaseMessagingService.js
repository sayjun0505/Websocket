/* eslint-disable class-methods-use-this */
/* eslint import/no-extraneous-dependencies: off */
import FuseUtils from '@fuse/utils/FuseUtils';
// import { messaging } from './firebaseApp';
import { getToken } from 'firebase/messaging';

import { messaging } from './firebaseApp';

import { firebaseVapidKey } from './firebaseServiceConfig';

class FirebaseMessagingService extends FuseUtils.EventEmitter {
  init() {
    this.initialize();
  }

  initialize = () => {
    // console.log('👉✉️ initialize FirebaseMessagingService');
  };

  getMessagingToken = () => {
    // console.log('👉✉️ getMessagingToken ');
    return new Promise((resolve, reject) => {
      getToken(messaging, {
        vapidKey: firebaseVapidKey,
      })
        .then((currentToken) => {
          if (currentToken) {
            // console.info('👉✉️ Registration token available.');
            resolve(currentToken);
          } else {
            // Show permission request UI
            // console.info(
            //   '👉✉️ No registration token available. Request permission to generate one.'
            // );
            resolve();
          }
        })
        .catch((err) => {
          // console.error('👉✉️ An error occurred while retrieving token. ', err);
          reject(err);
        });
    });
  };

  // onMessageListener = () =>
  //   new Promise((resolve) => {
  //     messaging.onMessage((payload) => {
  //       console.log('👉✉️ onMessageListener', payload);
  //       resolve(payload);
  //     });
  //   });
}

const instance = new FirebaseMessagingService();

export default instance;
