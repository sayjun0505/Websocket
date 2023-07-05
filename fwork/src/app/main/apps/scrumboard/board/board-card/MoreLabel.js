// import Tooltip from '@mui/material/Tooltip';
import { MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectLabelById } from '../../store/labelsSlice';

const MoreLabel = (props) => {
  const { id } = props;

  const label = useSelector((state) => selectLabelById(state, id));

  if (!label) {
    return null;
  }

  return (
    <MenuItem
      key={label.id}
      size="small"
      variant="outlined"
      className="w-min truncate rounded my-1 text-black bg-gray-200 text-[12px]"
      label={label.label}
    >
      {label.title}
    </MenuItem>
  );
};

export default MoreLabel;
