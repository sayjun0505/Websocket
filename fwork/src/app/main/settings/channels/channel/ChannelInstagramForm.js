import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import Box from '@mui/system/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
// import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
// import Checkbox from '@mui/material/Checkbox/Checkbox';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { selectPermission } from 'app/store/permissionSlice';
import InstagramList from './components/InstagramList';
import {
  exchangeToken,
  getFacebookUser,
  logout,
  removeFacebookUserTokenChannel,
  selectFacebookUser,
} from '../store/facebookSlice';
import ChannelsContext from '../ChannelsContext';

const ChannelInstagramForm = (props) => {
  const { setRightSidebarOpen, rightSidebarOpen } = useContext(ChannelsContext);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
  // const facebookAppId = '1365602510476429';

  // const org = useSelector(({ auth }) => auth.organization.organization);
  const userData = useSelector(({ user }) => user.data);
  const facebookUser = useSelector(selectFacebookUser);
  const permission = useSelector(selectPermission);
  const [loading, setLoading] = useState(true);
  const [pageListLoading, setPageListLoading] = useState(true);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  useEffect(() => {
    if (userData && userData.facebookToken) {
      dispatch(getFacebookUser(userData.facebookToken)).then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [dispatch, userData]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.channel && !permission.channel.create) {
        navigate('/settings/channels');
      }
    } else if (permission && permission.channel && !permission.channel.update) {
      navigate(-1);
    }
  }, [permission]);

  function handleLogout() {
    dispatch(logout());
    dispatch(removeFacebookUserTokenChannel());
  }

  function responseFacebook(response) {
    // console.log('Facebook Login Response ', response);
    if (response.accessToken && !response.error) {
      dispatch(exchangeToken(response.accessToken));
    } else {
      // console.log('Facebook Login error ', response.error);
      handleLogout();
    }
  }

  if (loading) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48 mt-48">
        {facebookUser ? (
          <div className="flex flex-col w-full space-y-16 mt-12">
            <div className="flex sm:flex-row flex-col justify-between sm:space-y-0 space-y-16">
              <div className="flex flex-row space-x-16 items-center">
                <Avatar
                  src={facebookUser.picture.data.url}
                  alt={facebookUser.name}
                  className="w-64 h-64"
                />
                <div className="flex flex-col space-y-6">
                  <Typography variant="h6">{`${facebookUser.name}`}</Typography>
                  <Typography variant="subtitle2">{facebookUser.email}</Typography>
                </div>
              </div>

              <div className="flex sm:flex-col flex-row sm:space-y-8 space-x-8 items-end">
                <FacebookLogin
                  appId={facebookAppId}
                  fields="name,email,picture"
                  scope="public_profile,pages_show_list,pages_manage_metadata,pages_messaging,email,pages_read_engagement,instagram_basic,instagram_manage_messages"
                  callback={responseFacebook}
                  icon="fa-facebook"
                  render={(renderProps) => (
                    <Button onClick={renderProps.onClick} variant="outlined" color="secondary">
                      Edit
                    </Button>
                  )}
                />

                <Button variant="outlined" color="error" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
            <Alert className="my-16 " variant="outlined" severity="info">
              If invisible page in this list click Edit {'->'} Edit settings.
            </Alert>
            <InstagramList />
          </div>
        ) : (
          <div className="flex w-full items-center">
            <FacebookLogin
              appId={facebookAppId}
              fields="name,email,picture"
              scope="public_profile,pages_show_list,pages_manage_metadata,pages_messaging,email,pages_read_engagement,instagram_basic,instagram_manage_messages"
              callback={responseFacebook}
              icon="fa-facebook"
              render={(renderProps) => (
                <Button
                  onClick={renderProps.onClick}
                  variant="outlined"
                  color="primary"
                  className="bg-blue-500 px-4 py-2 text-white inline-flex items-center space-x-2 rounded"
                >
                  <svg
                    className="w-24 h-24 p-4 fill-current"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Login with Facebook
                </Button>
              )}
            />
          </div>
        )}
      </div>

      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
          Back
        </Button>
      </Box>
    </>
  );
};

export default ChannelInstagramForm;
