import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearNotification, getNotifications,setNotificationforSocket, updateFCMToken,setPages,setCurrentPage } from 'app/store/notificationsSlice';
import NotificationTemplate from 'app/theme-layouts/shared-components/notificationPanel/NotificationTemplate';
import { onMessage } from 'firebase/messaging';
import { useAuth } from '../auth/AuthContext';
import { messaging } from '../auth/services/firebaseService/firebaseApp';
import firebaseMessagingService from '../auth/services/firebaseService/firebaseMessagingService';
import firebaseAuthService from '../auth/services/firebaseService/firebaseAuthService';
import {SocketContext} from '../context/socket';
import { showMessage } from 'app/store/fuse/messageSlice';
const NotificationContext = createContext({});

const NotificationProvider = (props) => {
  const dispatch = useDispatch();
  const auth = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const socket = useContext(SocketContext);
  const { organizationId } = useSelector(({ organization }) => organization);
  const [userConsent, setUserConsent] = useState();
  const [tabHasFocus, setTabHasFocus] = useState(true);
  const [token, setToken] = useState(null);
  const [eventUpdate, setEventUpdate] = useState();
  const [eventData, setEventData] = useState();
  const user = useSelector(state=>{return state.user});
  useEffect(()=>{
    socket.on("getNotifications response", res=>{
      dispatch(setNotificationforSocket(res.data))
      dispatch(setPages(res.pages));
      dispatch(setCurrentPage(res.currentPage));
    })    
  },[socket])
  useEffect(() => {
    const isPushNotificationSupported = () => {
      return 'serviceWorker' in navigator && 'PushManager' in window;
    };
    // Check Notification Support
    if (isPushNotificationSupported()) {
      if (!('Notification' in window)) {
        // console.log('✉️ This browser does not support desktop notification');
      }
      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        // console.info('✉️ Notification permission granted. ', Notification.permission);
        setUserConsent(Notification.permission);
        // var notification = new Notification("Hi there!");
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === 'granted') {
            // console.info('✉️ Notification permission granted.');
            setUserConsent(Notification.permission);
            // var notification = new Notification("Hi there!");
          } else {
            // console.info('✉️ Notification permission: ', Notification.permission);
          }
        });
      }
    } else {
      // console.info('✉️ >> Notification are NOT supported by this browser.');
    }

    const getNewToken = () => {
      firebaseAuthService.getAccessToken().then((idToken) => {
        setToken(idToken);
      });
    };

    // Get Firebase auth Token
    getNewToken();

    // Set Browser Tab focus
    const handleFocus = () => {
      // console.log('✉️ FoxConnect Tab has focus.');
      // console.log("1")
      let params={
        requester: user,
        page: '',
        size: '',
      }
      // console.error("3a")
      // socket.emit("getNotifications",params);
      dispatch(getNotifications());
      setTabHasFocus(true);
    };
    const handleBlur = () => {
      // console.log('✉️ FoxConnect Tab lost focus.');
      setTabHasFocus(false);
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const isShowNotification = (notificationType) => {
      const type = window.location.pathname.split('/');
      // console.log('✉️ Path (App):', type[2].toLocaleLowerCase());
      // console.log('✉️ Notification Type:', notificationType.toLocaleLowerCase());

      if (notificationType && type.length > 2 && type[2]) {
        return !(
          type[2].toLocaleLowerCase() === notificationType.toLocaleLowerCase() ||
          (type[2].toLocaleLowerCase() === 'kanbanboard' &&
            notificationType.toLocaleLowerCase() === 'scrumboard')
        );
      }
      return true;
    };

    if (userConsent && userConsent === 'granted') {
      firebaseMessagingService.getMessagingToken().then((currentToken) => {
        if (currentToken && token) {
          // console.log('✉️ [FCM] Update Token');
          // console.log("11")
          let params={
            token:currentToken,
            requster:user.uuid
          }
          // socket.emit("updateFCMToken",params);
          // console.error("aaaaaa")
          // dispatch(updateFCMToken(currentToken));
          onMessage(messaging, (payload) => {
            // console.log('✉️ [FCM] Message received', payload.messageId);
            // console.error("4")
            dispatch(getNotifications());
            if (payload && payload.messageId && isShowNotification(payload.data.type)) {
              const data = JSON.parse(payload.data.data);
              const organization = JSON.parse(payload.data.organization);
              const createdAt = new Date(payload.data.createdAt);
              const notification = { ...payload.data, createdAt, data, organization };
              enqueueSnackbar(payload.title, {
                preventDuplicate: true,
                key: payload.messageId,
                // eslint-disable-next-line react/no-unstable-nested-components
                content: () => (
                  <NotificationTemplate
                    item={notification}
                    onClose={() => {
                      closeSnackbar(payload.messageId);
                    }}
                  />
                ),
              });
            }
          });
        }
      });
    }
  }, [dispatch, userConsent, token]);

  useEffect(() => {
    // SSE Connection
    const sseConnection = () => {
      // Init Event connection
      if (organizationId && token) {
        // console.info('✉️ [SSE] Start Connecting');
        // establish a connection with token
        const events = new EventSource(
          `${process.env.REACT_APP_BACKEND_URL}/api/sse/events?authorization=${token}&organizationId=${organizationId}`
        );
        // handle incoming messages
        events.onmessage = (event) => {
          const parsedData = JSON.parse(event.data);
          switch (parsedData.type) {
            case 'init-connection':
              // console.info('✉️ [SSE] ✔️ Init Connection Id: ', parsedData.processId);
              // setProcessId(parsedData.processId);
              break;
            default:
              // console.log('✉️ [SSE] onMessage ', parsedData);
              setEventUpdate(new Date());
              setEventData(parsedData);
          }
        };
        // handle connection errors
        events.onerror = (msg) => {
          const err = JSON.parse(msg.data);
          const isTokenErr = err.code >= 40140 && err.code < 40150;
          if (isTokenErr) {
            // console.info('✉️ [SSE] ⭕️ ReConnection.');
            events.close();
            firebaseAuthService
              .getAccessToken()
              .then((idToken) => {
                setToken(idToken);
              })
              .then(() => {
                sseConnection();
              });
          } else {
            // ... handle other types of error -- for example, retry on 5xxxx, close on 4xxxx
          }
        };
      }
    };

    if (organizationId && token) {
      sseConnection();
    }
  }, [organizationId, token]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      // console.log("4")
      let params={
        requester: user,
        page: '',
        size: '',
      }
      // console.error("5")
      // socket.emit("getNotifications",params);
      // dispatch(getNotifications());
    }
    return () => {
      dispatch(clearNotification());
    };
  }, [auth, dispatch]);

  const NotificationProviderValue = useMemo(
    () => ({
      tabHasFocus,
      eventUpdate,
      eventData,
    }),
    [tabHasFocus, eventUpdate, eventData]
  );

  return (
    <NotificationContext.Provider value={NotificationProviderValue}>
      {props.children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
export { NotificationProvider, useNotification };
