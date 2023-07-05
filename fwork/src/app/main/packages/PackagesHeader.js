import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  selectFilteredActivations,
  selectSearchText,
  setActivationsSearchText,
} from './store/activationsSlice';

function PackagesHeader(props) {
  const dispatch = useDispatch();
  const searchText = useSelector(selectSearchText);
  const activations = useSelector(selectFilteredActivations);

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
            to="/organizations"
            color="inherit"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-sm-left</FuseSvgIcon>
            <span className="flex mx-4 font-medium">Organizations</span>
          </Typography>
        </motion.div>
        <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          className="text-24 md:text-32 font-extrabold tracking-tight leading-none mx-8 sm:mx-16"
        >
          Packages
        </Typography>
        <Typography
          component={motion.span}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          delay={500}
          className="text-14 font-medium ml-2 mx-8 sm:mx-16"
          color="text.secondary"
        >
          {`${activations.length} package`}
        </Typography>
      </div>

      <div className="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8">
        <Paper
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          className="flex items-center w-full sm:max-w-256 space-x-8 px-16 rounded-full border-1 shadow-0"
        >
          <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>

          <Input
            placeholder="Search packages"
            className="flex flex-1"
            disableUnderline
            fullWidth
            value={searchText}
            inputProps={{
              'aria-label': 'Search',
            }}
            onChange={(ev) => dispatch(setActivationsSearchText(ev))}
          />
        </Paper>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
        >
          <Button
            className=""
            component={Link}
            // to="/packages/new/edit"
            to="/packages/pricing"
            variant="contained"
            color="secondary"
            startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
          >
            New Package
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default PackagesHeader;
