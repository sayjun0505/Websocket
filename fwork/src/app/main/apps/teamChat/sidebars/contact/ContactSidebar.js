import { useContext, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
// import { selectContactById } from '../../store/contactsSlice';
// import ContactAvatar from '../../ContactAvatar';
// import ChatAppContext from '../../ChatAppContext';

import { getContact, selectDirectMessageUser } from '../../store/directMessageUserSlice';
import TeamChatAppContext from '../../TeamChatAppContext';

const ContactSidebar = (props) => {
  const dispatch = useDispatch();
  const { contactId } = useParams();
  const { setContactSidebarOpen, setMemberSidebarOpen } = useContext(TeamChatAppContext);

  const contact = useSelector(selectDirectMessageUser);

  useEffect(() => {
    if (contactId) {
      dispatch(getContact(contactId));
    }
  }, [contactId, dispatch]);

  if (!contact) {
    return null;
  }

  return (
    <div>
      <Box
        className="border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="flex items-center justify-between px-10">
          <Typography className="px-4 font-medium text-16" color="inherit" variant="subtitle1">
            Contact info
          </Typography>
          <IconButton
            onClick={() => {
              setContactSidebarOpen(false);
              setMemberSidebarOpen(false);
            }}
            color="inherit"
            size="large"
          >
            <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Toolbar>
      </Box>

      <div className="relative flex flex-col flex-auto items-center p-12 pt-0 sm:p-24 sm:pt-0">
        <div className="w-full max-w-3xl">
          <div className="flex flex-auto items-end mt-12">
            <Avatar
              sx={{
                borderWidth: 4,
                borderStyle: 'solid',
                borderColor: 'background.paper',
                backgroundColor: 'background.default',
                color: 'text.secondary',
              }}
              className="w-96 h-96 text-48 font-bold"
              src={contact.pictureURL}
              alt={contact.display}
            >
              {contact.display && contact.display.charAt(0)}
            </Avatar>
          </div>

          <Typography className="mt-12 text-xl font-bold truncate">{contact.display}</Typography>

          <div className="flex flex-wrap items-center mt-8">
            {contact.team && (
              <Chip
                key={contact.team.id}
                label={contact.team.name}
                // label={_.find(tags, { id }).title}
                className="mr-12 mb-12"
                size="small"
              />
            )}
          </div>

          <Divider className="my-24" />

          <div className="flex flex-col space-y-24">
            {contact.firstname && contact.lastname && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:user</FuseSvgIcon>
                <div className="ml-24 leading-6">{`${contact.firstname} ${contact.lastname}`}</div>
              </div>
            )}

            {contact.mobile && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:phone</FuseSvgIcon>
                <div className="ml-24 leading-6">{contact.mobile}</div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:mail</FuseSvgIcon>
                <div className="ml-24 leading-6">{contact.email}</div>
              </div>
            )}

            {contact.address && (
              <div className="flex">
                <FuseSvgIcon>heroicons-outline:location-marker</FuseSvgIcon>
                <div
                  className="max-w-none ml-24 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: contact.address }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSidebar;
