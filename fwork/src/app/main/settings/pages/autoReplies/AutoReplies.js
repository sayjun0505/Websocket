import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import AutoRepliesHeader from './AutoRepliesHeader';
import AutoRepliesList from './AutoRepliesList';

// import RepliesSidebarContent from './RepliesSidebarContent';
import { getAutoReplies } from '../../store/autoRepliesSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const AutoReplies = () => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  // const routeParams = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    dispatch(getAutoReplies());
  }, [dispatch]);

  return (
    <Root
      header={<AutoRepliesHeader pageLayout={pageLayout} />}
      content={<AutoRepliesList />}
      ref={pageLayout}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

// export default withReducer('repliesSetting', reducer)(QuickReply);
export default AutoReplies;
