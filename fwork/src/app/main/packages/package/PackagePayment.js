import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getActivation, selectActivation } from '../store/activationSlice';
import PromptPay from './paymentTabs/PromptPay';
// import CreditCard from './paymentTabs/CreditCard';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const PackagePayment = () => {
  const activation = useSelector(selectActivation);
  const routeParams = useParams();
  const dispatch = useDispatch();

  const [tab, setTab] = useState(1);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [QRCodeImage, setQRCodeImage] = useState(null);

  useEffect(() => {
    if (!process.env.REACT_APP_GBPAY_TOKEN || !process.env.REACT_APP_GBPAY_URL) {
      // console.error('[ENV] need to setup GBPAY ENV');
    }
    // return () => {
    //   dispatch(resetActivation());
    // };
  }, []);

  useEffect(() => {
    dispatch(getActivation(routeParams.id)).catch(() => {
      setLoading(false);
    });
  }, [dispatch, routeParams]);

  useEffect(() => {
    if (activation && activation.package) {
      if (activation.paymentType === 'PromptPay') {
        setTab(0);
      } else if (activation.paymentType === 'CreditCard') {
        setTab(1);
      }
    }
  }, [activation, period]);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <div className="relative flex flex-col flex-auto items-center  pt-20">
      <div className="w-full max-w-3xl">
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="PromptPay" {...a11yProps(0)} disabled />
              {/* <Tab label="Credit Card" {...a11yProps(1)} disabled /> */}
            </Tabs>
          </Box>
          <TabPanel value={tab} index={0}>
            <PromptPay activation={activation} />
          </TabPanel>
          {/* <TabPanel value={tab} index={1}>
              <CreditCard activation={activation} />
            </TabPanel> */}
        </Box>
      </div>
    </div>
  );
};

export default PackagePayment;
