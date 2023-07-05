import Chip from '@mui/material/Chip';
import clsx from 'clsx';
import getUnixTime from 'date-fns/getUnixTime';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const BoardCardDueDate = ({ dueDate }) => {
  if (!dueDate) {
    return null;
  }

  return (
    <Chip
      size="small"
      className={clsx(
        'flex items-center font-semibold text-12 mx-4',
        getUnixTime(new Date()) > dueDate ? 'bg-red text-white' : 'bg-[#9e9e9e] text-white'
      )}
      sx={{
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
      label={format(fromUnixTime(dueDate), 'MMM do yy')}
      icon={
        <FuseSvgIcon size={16} color="inherit">
          heroicons-outline:clock
        </FuseSvgIcon>
      }
    />
  );
};

export default BoardCardDueDate;
