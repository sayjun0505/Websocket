import { styled } from '@mui/material/styles';
import withReducer from 'app/store/withReducer';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import RepliesHeader from './RepliesHeader';
import RepliesList from './RepliesList';
// import RepliesSidebarContent from './RepliesSidebarContent';
import reducer from '../store';
import { getReplies } from '../store/repliesSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

function Replies() {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  // const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    dispatch(getReplies());
  }, [dispatch]);

  // useEffect(() => {
  //   setRightSidebarOpen(Boolean(routeParams.id));
  // }, [routeParams]);

  return (
    <>
      <Root
        header={<RepliesHeader pageLayout={pageLayout} />}
        content={<RepliesList />}
        ref={pageLayout}
        // rightSidebarContent={<RepliesSidebarContent />}
        // rightSidebarOpen={rightSidebarOpen}
        // rightSidebarOnClose={() => setRightSidebarOpen(false)}
        // rightSidebarWidth={640}
        scroll={isMobile ? 'normal' : 'content'}
      />
    </>
  );
}

export default withReducer('repliesSetting', reducer)(Replies);
