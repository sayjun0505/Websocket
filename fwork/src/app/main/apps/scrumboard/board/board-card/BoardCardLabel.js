// import Tooltip from '@mui/material/Tooltip';
import { useSelector } from 'react-redux';
import Chip from '@mui/material/Chip';
import { selectLabelById } from '../../store/labelsSlice';

const BoardCardLabel = (props) => {
  const { id } = props;

  const label = useSelector((state) => selectLabelById(state, id));

  if (!label) {
    return null;
  }

  return (
    <div /* title={label.title} */ key={id}>
      <Chip className="font-semibold text-[12px] mx-2 mb-6 rounded" label={label.title} size="small" />
    </div>
  );
};

export default BoardCardLabel;
