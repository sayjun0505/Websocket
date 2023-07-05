import { List, ListItem } from '@mui/material';
import { ContactAvatar } from 'app/shared-components/chat';
import { selectUser } from 'app/store/userSlice';
import { useSelector } from 'react-redux';

const WidgetUsers = (props) => {
  // console.log(props);
  const loginUser = useSelector(selectUser);

  return (
    <List className="pb-16 flex flex-wrap justify-center">
      {props.data &&
        props.data.data &&
        props.data.data
          .filter((user) => user.id !== loginUser.uuid)
          .map((user, index) => (
            <ListItem key={index} className="max-w-60 p-0 m-10 md:mx-20">
              <ContactAvatar contact={user} className="w-60 h-60" />
            </ListItem>
          ))}
    </List>
  );
};

export default WidgetUsers;
