import { useSelector } from 'react-redux';
import PinsSidebar from './PinsSidebar';

const DmPinSidebar = (props) => {
  const { messages } = useSelector(({ teamchatApp }) => teamchatApp.directMessage);

  return <PinsSidebar messages={messages} />;
};

export default DmPinSidebar;
