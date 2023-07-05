import { styled } from '@mui/material/styles';
import withReducer from 'app/store/withReducer';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ChannelsSettingHeader from './ChannelsSettingHeader';
import ChannelsSettingList from './ChannelsSettingList';
import ChannelsSettingSidebarContent from './ChannelsSettingSidebarContent';
import reducer from './store';
import { getChannels, selectChannels } from './store/channelsSlice';

import ChannelsContext from './ChannelsContext';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const ChannelsSetting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const channels = useSelector(selectChannels);
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    dispatch(getChannels());
  }, [dispatch]);

  // useEffect(() => {
  //   setRightSidebarOpen(Boolean(routeParams.id));
  // }, [routeParams]);

  useEffect(() => {
    if (channels) {
      // console.log('Channels ', channels);
    }
  }, [channels]);

  const ChannelsProviderValue = useMemo(
    () => ({
      setRightSidebarOpen,
      rightSidebarOpen,
    }),
    [setRightSidebarOpen, rightSidebarOpen]
  );

  return (
    <ChannelsContext.Provider value={ChannelsProviderValue}>
      <Root
        header={<ChannelsSettingHeader pageLayout={pageLayout} />}
        content={<ChannelsSettingList />}
        ref={pageLayout}
        rightSidebarContent={<ChannelsSettingSidebarContent />}
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={() => {
          setRightSidebarOpen(false);
          navigate('/settings/channels');
        }}
        rightSidebarWidth={640}
        scroll={isMobile ? 'normal' : 'content'}
      />
    </ChannelsContext.Provider>
  );
};

export default withReducer('channelsSetting', reducer)(ChannelsSetting);
