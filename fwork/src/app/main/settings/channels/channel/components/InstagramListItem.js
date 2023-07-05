import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
// import StatusIcon from './StatusIcon';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectChannels } from '../../store/channelsSlice';
import { addInstagramChannel } from '../../store/channelSlice';

const InstagramListItem = (props) => {
  const { page } = props;
  const dispatch = useDispatch();

  const channels = useSelector(selectChannels);

  // const [connectError, setConnectError] = useState(false);

  const [facebookPage, setFacebookPage] = useState(null);
  const [foxInstagramAccount, setFoxInstagramAccount] = useState();

  function getFoxPageSetting() {
    if (channels) {
      const foxInstagramAccountFilter = channels.find((element) => {
        return (
          element.data &&
          element.data.pageId &&
          page.instagram_business_account &&
          page.instagram_business_account.id &&
          element.data.pageId === page.instagram_business_account.id
        );
      });
      if (foxInstagramAccountFilter) {
        setFoxInstagramAccount(foxInstagramAccountFilter);
      }
    }
  }

  const connectInstagramAccount = () => {
    // console.log('connectPage start ', page);
    const subscribeResult = axios
      .post(
        `https://graph.facebook.com/v15.0/${page.id}/subscribed_apps`,
        {},
        {
          headers: {
            Authorization: `Bearer ${page.access_token}`,
          },
          params: {
            subscribed_fields: 'messages,message_reactions,message_echoes',
          },
        }
      )
      .then(async (response) => {
        dispatch(
          addInstagramChannel({
            accessToken: page.access_token,
            pageId: page.instagram_business_account.id,
            fbPageId: page.id,
            name: page.instagram_business_account.name,
          })
        ).then((result) => {
          if (!result.error) {
            setFoxInstagramAccount(result);
            dispatch(
              showMessage({
                message: `${page.name} channel: Connected`,
                variant: 'success',
              })
            );
          }
        });

        // const newPageResult = await foxResult.data;
        // return newPageResult;
      })
      .catch((error) => {
        // console.error('[connectInstagramAccount] ', error);
        return error;
      });

    // console.log('connectPage', subscribeResult);
    return subscribeResult;
  };

  useMemo(() => {
    // get page channel setting
    if (page) {
      getFoxPageSetting();
      // console.log('PAGE ', page);
    }
  }, [page]);

  return (
    <>
      {page.instagram_business_account && (
        <ListItem className="px-32 py-16" sx={{ bgcolor: 'background.paper' }}>
          {page.instagram_business_account.profile_picture_url &&
            page.instagram_business_account.name && (
              <ListItemAvatar>
                <Avatar
                  src={page.instagram_business_account.profile_picture_url}
                  alt={page.instagram_business_account.username}
                />
              </ListItemAvatar>
            )}

          <ListItemText
            classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
            primary={`${
              page.instagram_business_account.name || page.instagram_business_account.username
            }`}
            // secondary={facebookPage.category}
          />
          {!foxInstagramAccount || foxInstagramAccount.status === 'delete' ? (
            <Button
              className="mx-8"
              variant="outlined"
              color="secondary"
              onClick={connectInstagramAccount}
            >
              <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
              <span className="mx-8">Add</span>
            </Button>
          ) : (
            <Button className="mx-8" variant="outlined" color="success" disabled>
              <FuseSvgIcon size={20}>heroicons-outline:check</FuseSvgIcon>
              <span className="mx-8">Added</span>
            </Button>
          )}
        </ListItem>
      )}
      <Divider />
    </>
  );
};

export default InstagramListItem;
