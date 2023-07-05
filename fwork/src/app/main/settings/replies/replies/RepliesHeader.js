import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
// import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import { Box } from '@mui/system';
import { Paper } from '@mui/material';
import { selectPermission } from 'app/store/permissionSlice';
import {
  selectFilteredReplies,
  selectSearchText,
  setRepliesSearchText,
} from '../store/repliesSlice';

const RepliesHeader = (props) => {
  const dispatch = useDispatch();
  const searchText = useSelector(selectSearchText);
  const filteredData = useSelector(selectFilteredReplies);
  const permission = useSelector(selectPermission);

  return (
    <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between py-32 px-24 md:px-32 border-b-1">
      <div className="flex flex-col items-center sm:items-start">
        <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          // className="text-24 md:text-32 font-extrabold tracking-tight leading-none"
          className="text-2xl font-semibold leading-tight"
        >
          Replies
        </Typography>
        <Typography
          component={motion.span}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          delay={500}
          className="text-14 font-medium ml-2"
          color="text.secondary"
        >
          {`${filteredData.length} reply`}
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
            placeholder="Search replies"
            className="flex flex-1"
            disableUnderline
            fullWidth
            value={searchText}
            inputProps={{
              'aria-label': 'Search',
            }}
            onChange={(ev) => dispatch(setRepliesSearchText(ev))}
          />
        </Paper>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
        >
          <Button
            className=""
            disabled={!(permission && permission.reply && permission.reply.create)}
            component={Link}
            to="/settings/replies/new/edit"
            variant="contained"
            color="secondary"
            startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
          >
            New
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RepliesHeader;
