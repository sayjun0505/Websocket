import _ from '@lodash';
import { styled } from '@mui/material/styles';
import { amber, red } from '@mui/material/colors';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { selectLabelsEntities } from './store/labelsSlice';
import { openEditTodoDialog, updateTodo } from './store/todosSlice';
import { getChatMessage } from './store/chatSlice';
import { setChatSelected } from './store/currentSlice';

import TodoChip from './TodoChip';

const StyledListItem = styled(ListItem)(({ theme, completed }) => ({
  ...(completed && {
    background: 'rgba(0,0,0,0.03)',
    '& .todo-title, & .todo-notes': {
      textDecoration: 'line-through',
    },
  }),
}));

const TodoListItem = (props) => {
  const dispatch = useDispatch();
  const labels = useSelector(selectLabelsEntities);

  return (
    <StyledListItem
      className="py-20 px-0 sm:px-8"
      completed={props.todo.completed ? 1 : 0}
      onClick={(ev) => {
        ev.preventDefault();
        if (props.todo.chatId.length > 0) {
          dispatch(getChatMessage({ chatId: props.todo.chatId, pNum: 0 }))
            .unwrap()
            .then((payload) => {
              setChatSelected(payload);
              dispatch(openEditTodoDialog(props.todo));
            });
        } else {
          dispatch(openEditTodoDialog(props.todo));
        }
      }}
      dense
      button
    >
      <IconButton
        tabIndex={-1}
        disableRipple
        onClick={(ev) => {
          ev.stopPropagation();
          dispatch(
            updateTodo({
              todo: {
                ...props.todo,
                completed: !props.todo.completed,
              },
            })
          );
        }}
        size="large"
      >
        {props.todo.completed ? (
          <Icon color="secondary">check_circle</Icon>
        ) : (
          <Icon color="action">radio_button_unchecked</Icon>
        )}
      </IconButton>

      <div className="flex flex-1 flex-col relative overflow-hidden px-8">
        <Typography
          className="todo-title truncate text-14 font-medium"
          color={props.todo.completed ? 'textSecondary' : 'inherit'}
        >
          {props.todo.title}
        </Typography>

        <Typography color="textSecondary" className="todo-notes truncate">
          {_.truncate(props.todo.notes.replace(/<(?:.|\n)*?>/gm, ''), {
            length: 180,
          })}
        </Typography>

        <div className="flex -mx-2 mt-8">
          {props.todo.labels.map((label) => (
            <TodoChip
              className="mx-2 mt-4"
              title={label.title}
              color={label.color}
              key={label.id}
            />
          ))}
        </div>
      </div>

      <div className="px-8">
        <IconButton
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            dispatch(
              updateTodo({
                todo: {
                  ...props.todo,
                  important: !props.todo.important,
                },
              })
            );
          }}
          size="large"
        >
          {props.todo.important ? (
            <Icon style={{ color: red[500] }}>error</Icon>
          ) : (
            <Icon>error_outline</Icon>
          )}
        </IconButton>
        <IconButton
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            dispatch(
              updateTodo({
                todo: {
                  ...props.todo,
                  starred: !props.todo.starred,
                },
              })
            );
          }}
          size="large"
        >
          {props.todo.starred ? (
            <Icon style={{ color: amber[500] }}>star</Icon>
          ) : (
            <Icon>star_outline</Icon>
          )}
        </IconButton>
      </div>
    </StyledListItem>
  );
};

export default TodoListItem;
