import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';

const AutoRepliesListItem = (props) => {
  return (
    <>
      <ListItem className=" py-16 font-bold w-full px-20">
        <div className="flex flex-row justify-between w-full">
          <div className="px-12">Title</div>
          <div className="flex justify-end">
            <div className="px-20">Message Type</div>
            <div className="px-20">Channel</div>
            <div className=" px-20">Status</div>
          </div>
        </div>
      </ListItem>
      <Divider />
    </>
  );
};

export default AutoRepliesListItem;
