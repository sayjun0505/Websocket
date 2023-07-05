import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import reducer from '../store';
import PaymentsHeader from './PaymentsHeader';
import PaymentsTable from './PaymentsTable';

function Payments() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <FusePageCarded
      header={<PaymentsHeader />}
      content={<PaymentsTable />}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default withReducer('packagesApp', reducer)(Payments);
