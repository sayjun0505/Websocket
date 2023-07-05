import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDeepCompareEffect } from '@fuse/hooks';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import withReducer from 'app/store/withReducer';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { getPayment, selectPayment } from '../store/paymentSlice';
import reducer from '../store';
import PaymentHeader from './PaymentHeader';
import DetailsTab from './tabs/DetailsTab';
import ReceiptTab from './tabs/ReceiptTab';
// import ProductImagesTab from './tabs/ProductImagesTab';
// import ShippingTab from './tabs/ShippingTab';

function Payment(props) {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const navigate = useNavigate();
  const payment = useSelector(selectPayment);
  // const payment = useSelector((state) => selectPaymentsById(state, routeParams.paymentId));
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [tabValue, setTabValue] = useState(1);
  const [noPayment, setNoPayment] = useState(false);

  useDeepCompareEffect(() => {
    function getInitPayment() {
      const { paymentId } = routeParams;
      dispatch(getPayment(paymentId)).then((action) => {
        if (!action.payload) {
          setNoPayment(true);
          navigate(-1);
        }
      });
    }

    getInitPayment();
  }, [dispatch, routeParams]);

  function handleTabChange(event, value) {
    setTabValue(value);
  }

  if (noPayment) {
    navigate(-1);
  }

  return (
    <FusePageCarded
      header={<PaymentHeader />}
      content={
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            classes={{ root: 'w-full h-64 border-b-1' }}
          >
            <Tab className="h-64" label="Payment Details" />
            <Tab className="h-64" label="Receipt" />
          </Tabs>
          <div className="p-16 sm:p-24 w-full">
            <div className={tabValue !== 0 ? 'hidden' : ''}>
              <DetailsTab />
            </div>

            <div className={tabValue !== 1 ? 'hidden' : ''}>
              <ReceiptTab />
            </div>
          </div>
        </>
      }
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default withReducer('packagesApp', reducer)(Payment);
