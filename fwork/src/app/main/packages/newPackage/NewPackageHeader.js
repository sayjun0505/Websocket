import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectPackages } from '../store/packagesSlice';

const NewPackageHeader = (props) => {
  const dispatch = useDispatch();
  const packages = useSelector(selectPackages);

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
            to="/packages"
            color="inherit"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-sm-left</FuseSvgIcon>
            <span className="flex mx-4 font-medium">Back</span>
          </Typography>
        </motion.div>
      </div>
    </div>
  );
};

export default NewPackageHeader;
