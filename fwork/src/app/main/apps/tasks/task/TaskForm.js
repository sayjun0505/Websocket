import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {  useEffect, useContext } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from '@lodash';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import Box from '@mui/system/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import IconButton from '@mui/material/IconButton';
import TaskPrioritySelector from './TaskPrioritySelector';
import TaskTag from './TaskTag';
import FormActionsMenu from './FormActionsMenu';
import { newTask, selectTask,getTaskforSocket ,addTaskforSocket,updateTaskforSocket} from '../store/taskSlice';
import {SocketContext} from '../../../../context/socket';

const schema = yup.object().shape({
  title: yup.string().required('You must enter a name'),
});

const TaskForm = (props) => {
  const task = useSelector(selectTask);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  // const form = watch();
  const type = watch('type');
  const socket = useContext(SocketContext);
  const user = useSelector(state => { return state.user });
  const organization = window.localStorage.getItem('organization');
  useEffect(()=>{
    socket.on("updateTask response", res=>{
      dispatch(updateTaskforSocket(res))
    })
    socket.on("getTask response", res=>{
      dispatch(getTaskforSocket(res))
    })
    socket.on("addTask response", res=>{
      dispatch(addTaskforSocket(res))
      navigate(`/apps/tasks/${res.id}`);
    })
  },[socket])


  useEffect(() => {
    if (routeParams.id === 'new') {
      dispatch(newTask(routeParams.type));
    } else {
      socket.emit("getTask",{task:routeParams.id,reqid:user.uuid,orgId:JSON.parse(organization).organizationId })
    }
  }, [dispatch, routeParams]);

  useEffect(() => {
    reset({ ...task });
  }, [task, reset]);

  function onSubmit(data) {
    socket.emit("updateTask",{task:data,reqid:user.uuid,orgId:JSON.parse(organization).organizationId })
  }

  function onSubmitNew(data) {
    socket.emit("addTask",{task:data,reqid:user.uuid,orgId:JSON.parse(organization).organizationId })
  }

  if (!task) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48">
        <div className="flex items-center justify-between border-b-1 w-full py-24 mt-16 mb-32">
          <Controller
            control={control}
            name="completed"
            render={({ field: { value, onChange } }) => (
              <Button className="font-semibold" onClick={() => onChange(!value)}>
                <Box sx={{ color: value ? 'secondary.main' : 'text.disabled' }}>
                  <FuseSvgIcon>heroicons-outline:check-circle</FuseSvgIcon>
                </Box>
                <span className="mx-8">
                  {task.completed ? 'MARK AS INCOMPLETE' : 'MARK AS COMPLETE'}
                </span>
              </Button>
            )}
          />
          <div className="flex items-center">
            {routeParams.id !== 'new' && <FormActionsMenu taskId={task.id} />}
            <IconButton className="" component={NavLinkAdapter} to="/apps/tasks" size="large">
              <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </div>
        </div>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              className="mt-32 max-h-auto"
              {...field}
              label={`${_.upperFirst(type)} title`}
              placeholder="Job title"
              id="title"
              error={!!errors.title}
              helperText={errors?.title?.message}
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
            />
          )}
        />

        <Controller
          control={control}
          name="tags"
          render={({ field: { onChange, value } }) => <TaskTag value={value} onChange={onChange} />}
        />
        <div className="flex w-full space-x-16 mt-32 mb-16 items-center">
          <Controller
            control={control}
            name="priority"
            render={({ field }) => <TaskPrioritySelector {...field} />}
          />

          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DateTimePicker
                {...field}
                className="w-full"
                clearable
                showTodayButton
                renderInput={(_props) => (
                  <TextField
                    className=""
                    id="due-date"
                    label="Due date"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    {..._props}
                  />
                )}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="Notes"
              placeholder="Notes"
              id="notes"
              error={!!errors.notes}
              helperText={errors?.notes?.message}
              variant="outlined"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              InputProps={{
                className: 'max-h-min h-min items-start',
                startAdornment: (
                  <InputAdornment className="mt-16" position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:menu-alt-2</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>
      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
          Cancel
        </Button>
        {routeParams.id === 'new' ? (
          <Button
            className="ml-8"
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid}
            onClick={handleSubmit(onSubmitNew)}
          >
            Create
          </Button>
        ) : (
          <Button
            className="ml-8"
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        )}
      </Box>
    </>
  );
};

export default TaskForm;
