import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

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

const GeneralSettingSidebarContent = (props) => {
  const dispatch = useDispatch();

  return (
    <div className="px-16 py-24">
      <div
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      >
        <List className="">
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

          {/* <StyledListItem
            button
            component={NavLinkAdapter}
            to="/settings/general/motopress"
            end
            activeClassName="active"
          >
            <FuseSvgIcon className="list-item-icon" color="disabled">
              material-outline:shopping_cart
            </FuseSvgIcon>
            <ListItemText className="truncate" primary="Motopress" disableTypography />
          </StyledListItem> */}

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

          <StyledListItem
            button
            component={NavLinkAdapter}
            to="/settings/replies"
            end
            activeClassName="active"
          >
            <FuseSvgIcon className="list-item-icon" color="disabled">
              material-outline:quickreply
            </FuseSvgIcon>
            <ListItemText className="truncate" primary="Replies" disableTypography />
          </StyledListItem>

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
        </List>
      </div>
    </div>
  );
};

export default GeneralSettingSidebarContent;
