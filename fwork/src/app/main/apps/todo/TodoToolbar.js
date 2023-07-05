import FormControl from '@mui/material/FormControl';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useDispatch, useSelector } from 'react-redux';
import { changeOrder, toggleOrderDescending } from './store/todosSlice';

const TodoToolbar = (props) => {
  const dispatch = useDispatch();
  const orderBy = useSelector(({ todoApp }) => todoApp.todos.orderBy);
  const orderDescending = useSelector(({ todoApp }) => todoApp.todos.orderDescending);

  function handleOrderChange(ev) {
    dispatch(changeOrder(ev.target.value));
  }

  return (
    <div className="flex justify-between w-full">
      <div className="flex" />
      <div className="flex items-center">
        <FormControl className="" variant="filled">
          <Select
            value={orderBy}
            onChange={handleOrderChange}
            displayEmpty
            name="filter"
            classes={{ select: 'py-8' }}
          >
            <MenuItem value="">
              <em>Order by</em>
            </MenuItem>
            <MenuItem value="startDate">Start Date</MenuItem>
            <MenuItem value="dueDate">Due Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={(ev) => dispatch(toggleOrderDescending())} size="large">
          <Icon style={{ transform: orderDescending ? 'scaleY(-1)' : 'scaleY(1)' }}>sort</Icon>
        </IconButton>
      </div>
    </div>
  );
};

export default TodoToolbar;
