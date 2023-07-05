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
import { addFacebookChannel } from '../../store/channelSlice';

const FacebookPageListItem = (props) => {
  const { page } = props;
  const dispatch = useDispatch();

  const channels = useSelector(selectChannels);

  const [connectError, setConnectError] = useState(false);

  // const [facebookPage, setFacebookPage] = useState(null);
  const [foxPage, setFoxPage] = useState();

  function getFoxPageSetting() {
    if (channels) {
      const foxFacebookPageFilter = channels.filter((element) => {
        // return element.facebook && element.facebook.pageId === page.id;
        return (
          element.data && element.data.pageId && page && page.id && element.data.pageId === page.id
        );
      });
      if (foxFacebookPageFilter.length > 0) {
        setFoxPage(foxFacebookPageFilter[0]);
      }
    }
  }

  // const getFacebookPageInformation = () => {
  //   const ret = axios
  //     .get(`https://graph.facebook.com/v12.0/${page.id}`, {
  //       headers: {
  //         Authorization: `Bearer ${page.access_token}`,
  //       },
  //       params: {
  //         fields: 'name,picture{url},category',
  //       },
  //     })
  //     .then((response) => {
  //       console.log('[getFacebookPageInformation] ', response.data.picture.url);
  //       setFacebookPage(response.data);
  //       // return response.data;
  //     })
  //     .catch((error) => {
  //       console.error('[getFacebookPageInformation] ', error);
  //       // return error;
  //     });

  //   // console.log('facebook page ', ret);
  //   return ret;
  // };

  const connectPage = () => {
    // console.log('connectPage start ', page);
    const subscribeResult = axios
      .post(
        `https://graph.facebook.com/v14.0/${page.id}/subscribed_apps`,
        {},
        {
          headers: {
            Authorization: `Bearer ${page.access_token}`,
          },
          params: {
            subscribed_fields: 'messages,message_reactions,message_echoes,messaging_postbacks',
          },
        }
      )
      .then(async (response) => {
        dispatch(
          addFacebookChannel({
            accessToken: page.access_token,
            pageId: page.id,
            name: page.name,
            // instagram: {
            //   accessToken: page.access_token,
            //   pageId: page.instagram_business_account.id,
            //   name: page.instagram_business_account.name,
            // },
          })
        ).then((result) => {
          if (!result.error) {
            setFoxPage(result);
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
        // console.error('[getFacebookPageInformation] ', error);
        return error;
      });

    // console.log('connectPage', subscribeResult);
    return subscribeResult;
  };

  useMemo(() => {
    // get page channel setting
    if (page) {
      getFoxPageSetting();
      // getFacebookPageInformation();
    }
  }, [page]);

  return (
    <>
      {page && (
        <ListItem className="px-32 py-16" sx={{ bgcolor: 'background.paper' }}>
          {page.picture && page.picture.data && page.picture.data.url && (
            <ListItemAvatar>
              <Avatar src={page.picture.data.url} alt={page.name} />
            </ListItemAvatar>
          )}
          <ListItemText
            classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
            primary={`${page.name}`}
            secondary={page.category}
          />
          {!foxPage || foxPage.status === 'delete' ? (
            <Button className="mx-8" variant="outlined" color="secondary" onClick={connectPage}>
              <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
              <span className="mx-8">Add</span>
            </Button>
          ) : (
            <Button
              className="mx-8"
              variant="outlined"
              color="success"
              disabled
              onClick={connectPage}
            >
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

export default FacebookPageListItem;
