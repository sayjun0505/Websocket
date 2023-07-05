import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

function PaymentHeader(props) {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between py-32 px-24 md:px-32 border-b-1">
      <div className="flex flex-col items-center sm:items-start">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
        >
          <Typography
            className="flex items-center sm:mb-12"
            component={Link}
            role="button"
            // to="/packages"
            to={-1}
            color="inherit"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-sm-left</FuseSvgIcon>
            <span className="flex mx-4 font-medium">Payment History</span>
          </Typography>
        </motion.div>
        <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          className="text-24 md:text-32 font-extrabold tracking-tight leading-none mx-8 sm:mx-16"
        >
          Payment History
        </Typography>
      </div>
    </div>
  );
}

export default PaymentHeader;
