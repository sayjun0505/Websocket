import List from '@mui/material/List';
// import { useTheme } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InstagramListItem from './InstagramListItem';
import {
  // getPageInstagramList,
  getPageList,
  selectFacebookUser,
  selectPages,
} from '../../store/facebookSlice';

const InstagramList = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(({ user }) => user.data);
  const facebookUser = useSelector(selectFacebookUser);
  const pages = useSelector(selectPages);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (facebookUser && facebookUser.id && userData && userData.facebookToken) {
      // dispatch(
      //   getPageInstagramList({ userID: facebookUser.id, accessToken: userData.facebookToken })
      // );
      dispatch(getPageList({ userID: facebookUser.id, accessToken: userData.facebookToken })).then(
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, [dispatch, facebookUser, userData]);

  if (loading) {
    return <FuseLoading />;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      className="flex flex-col flex-auto w-full max-h-full"
    >
      <List className="w-full m-0 p-0">
        {pages.map((item) => (
          <InstagramListItem key={item.id} page={item} />
        ))}
      </List>
    </motion.div>
  );
};

export default InstagramList;
