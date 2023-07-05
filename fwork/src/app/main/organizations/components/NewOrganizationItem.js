import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
import { useDispatch } from 'react-redux';
import Typography from '@mui/material/Typography';

import { openOrganizationDialog } from '../store/organizationsSlice';

const NewOrganizationItem = (props) => {
  const dispatch = useDispatch();

  return (
    <Box
      sx={{
        borderColor: 'divider',
      }}
      className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer border-2 border-gray-300 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
      onClick={() => dispatch(openOrganizationDialog('new'))}
      onKeyDown={() => dispatch(openOrganizationDialog('new'))}
      role="button"
      tabIndex={0}
    >
      <FuseSvgIcon size={48} color="disabled">
        heroicons-outline:plus
      </FuseSvgIcon>
      <Typography variant="h6" sx={{ color: 'rgb(156 163 175)' }}>
        Available: {props.slot}
      </Typography>
    </Box>
  );
};

export default NewOrganizationItem;
