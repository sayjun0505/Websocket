import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectFilters } from './store/filtersSlice';
import { selectFolders } from './store/foldersSlice';
import { selectLabels } from './store/labelsSlice';
import { openNewTodoDialog } from './store/todosSlice';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  color: 'inherit!important',
  textDecoration: 'none!important',
  height: 40,
  width: '100%',
  borderRadius: 6,
  paddingLeft: 12,
  paddingRight: 12,
  marginBottom: 4,
  '&.active': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, .05)!important'
        : 'rgba(255, 255, 255, .1)!important',
    pointerEvents: 'none',
    '& .list-item-icon': {
      color: 'inherit',
    },
  },
  '& .list-item-icon': {
    fontSize: 16,
    width: 16,
    height: 16,
    marginRight: 16,
  },
}));

const TodoSidebarContent = (props) => {
  const { selectedAccount } = props;
  const dispatch = useDispatch();
  const labels = useSelector(selectLabels);
  const folders = useSelector(selectFolders);
  const filters = useSelector(selectFilters);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
      className="flex-auto border-l-1 border-solid"
    >
      <div className="p-24 pb-16">
        <Button
          onClick={() => {
            dispatch(openNewTodoDialog(selectedAccount));
          }}
          variant="contained"
          color="secondary"
          className="w-full"
        >
          Add task
        </Button>
      </div>

      <div className="px-12">
        <List>
          {folders.length > 0 &&
            folders.map((folder) => (
              <StyledListItem
                button
                component={NavLinkAdapter}
                to={`/apps/todo/${folder.handle}`}
                key={folder.id}
                activeClassName="active"
              >
                <Icon className="list-item-icon" color="action">
                  {folder.icon}
                </Icon>
                <ListItemText primary={folder.title} disableTypography />
              </StyledListItem>
            ))}
        </List>

        <List>
          <ListSubheader className="pl-12" disableSticky>
            FILTERS
          </ListSubheader>

          {filters.length > 0 &&
            filters.map((filter) => (
              <StyledListItem
                button
                component={NavLinkAdapter}
                to={`/apps/todo/${filter.handle}`}
                activeClassName="active"
                key={filter.id}
              >
                <Icon className="list-item-icon" color="action">
                  {filter.icon}
                </Icon>
                <ListItemText primary={filter.title} disableTypography />
              </StyledListItem>
            ))}
        </List>

        <List>
          <ListSubheader className="pl-12" disableSticky>
            LABELS
          </ListSubheader>

          {labels.length > 0 &&
            labels.map((label) => (
              <StyledListItem
                button
                component={NavLinkAdapter}
                to={`/apps/todo/label/${label.title.toLowerCase()}`}
                key={label.id}
              >
                <Icon className="list-item-icon" style={{ color: label.color }} color="action">
                  label
                </Icon>
                <ListItemText primary={label.title} disableTypography />
              </StyledListItem>
            ))}
        </List>
      </div>
    </motion.div>
  );
};

export default TodoSidebarContent;
