import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser } from 'app/store/userSlice';
import { authRoles } from '../../auth';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  color: 'inherit!important',
  textDecoration: 'none!important',
  height: 40,
  width: '100%',
  borderRadius: 20,
  paddingLeft: 16,
  paddingRight: 16,
  marginBottom: 8,
  fontWeight: 500,
  '&.active': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, .05)!important'
        : 'rgba(255, 255, 255, .1)!important',
    pointerEvents: 'none',
    '& .list-item-icon': {
      color: theme.palette.secondary.main,
    },
  },
  '& .list-item-icon': {
    marginRight: 16,
  },
}));

const SettingsSidebarContent = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  return (
    <div className="px-16 py-24">
      <div
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      >
        <List className="">
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/profile"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                material-outline:account_circle
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Profile" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/users"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                heroicons-outline:user
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Users" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/teams"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                heroicons-outline:users
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Teams" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.admin.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/channels"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                material-outline:public
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Channels" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/notification"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                heroicons-outline:bell
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Notification" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/quick-reply"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                material-outline:quickreply
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Quick Reply" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.user.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/auto-reply"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                material-outline:reply_all
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Auto-Reply" disableTypography />
            </StyledListItem>
          )}
          {user && user.role && authRoles.admin.includes(user.role) && (
            <StyledListItem
              button
              component={NavLinkAdapter}
              to="/settings/working-hours"
              end
              activeClassName="active"
            >
              <FuseSvgIcon className="list-item-icon" color="disabled">
                material-outline:access_time
              </FuseSvgIcon>
              <ListItemText className="truncate" primary="Working Hours" disableTypography />
            </StyledListItem>
          )}
        </List>
      </div>
    </div>
  );
};

export default SettingsSidebarContent;
