import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import QuickRepliesHeader from './QuickRepliesHeader';
import QuickRepliesList from './QuickRepliesList';
// import RepliesSidebarContent from './RepliesSidebarContent';
import { getQuickReplies } from '../../store/quickRepliesSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const QuickReplies = () => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  // const routeParams = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    dispatch(getQuickReplies());
  }, [dispatch]);

  return (
    <Root
      header={<QuickRepliesHeader pageLayout={pageLayout} />}
      content={<QuickRepliesList />}
      ref={pageLayout}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

// export default withReducer('repliesSetting', reducer)(QuickReply);
export default QuickReplies;
