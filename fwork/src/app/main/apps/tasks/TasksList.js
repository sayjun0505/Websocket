import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { reorderList, selectTasks } from './store/tasksSlice';
import TaskListItem from './TaskListItem';
import SectionListItem from './SectionListItem';

const TasksList = (props) => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);

  if (!tasks) {
    return null;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no tasks!
        </Typography>
      </div>
    );
  }

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    dispatch(
      reorderList({
        arr: tasks,
        startIndex: result.source.index,
        endIndex: result.destination.index,
      })
    );
  }
  return (
    <List className="w-full m-0 p-0">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list" type="list" direction="vertical">
          {(provided) => (
            <>
              <div ref={provided.innerRef}>
                {tasks.map((item, index) => {
                  if (item.type === 'task') {
                    return <TaskListItem key={item.id} index={item.orderIndex} data={item} />;
                  }

                  if (item.type === 'section') {
                    return <SectionListItem key={item.id} index={item.orderIndex} data={item} />;
                  }

                  return null;
                })}
              </div>
              {provided.placeholder}
            </>
          )}
        </Droppable>
      </DragDropContext>
    </List>
  );
};

export default TasksList;
