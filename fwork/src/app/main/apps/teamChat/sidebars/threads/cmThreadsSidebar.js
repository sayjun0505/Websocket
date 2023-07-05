import { styled } from '@mui/material/styles';
import { selectUser } from 'app/store/userSlice';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { getThreadMembers, selectThreadData, selectThreadMembers } from '../../store/threadSlice';
import ThreadsSidebar from './ThreadsSidebar';

const StyledMessageRow = styled('div')(({ theme }) => ({
  '&.contact': {
    '& .bubble': {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
    },
  },
  '&.me': {
    '& .bubble': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const CmThreadsSidebar = (props) => {
  const dispatch = useDispatch();
  const replies = useSelector(selectThreadData);
  const members = useSelector(selectThreadMembers);
  const loginUser = useSelector(selectUser);
  const { messages } = useSelector(({ teamchatApp }) => teamchatApp.channel);

  const threadsMessage = useMemo(
    () => messages.filter((message) => !message.isDelete && message.isReply),
    [messages]
  );
  const threadIds = useMemo(
    () =>
      threadsMessage.map((msg) => {
        return msg.id;
      }),
    [threadsMessage]
  );

  useEffect(() => {
    if (threadIds) {
      dispatch(getThreadMembers({ threadIds }));
    }
  }, [messages]);

  if (!threadsMessage || !replies || !members) {
    return (
      <div className="flex w-full h-full items-center">
        <FuseLoading />
      </div>
    );
  }

  return (
    <ThreadsSidebar
      threadsMessage={threadsMessage}
      loginUser={loginUser}
      replies={replies}
      members={members}
    />
  );
};
export default CmThreadsSidebar;
