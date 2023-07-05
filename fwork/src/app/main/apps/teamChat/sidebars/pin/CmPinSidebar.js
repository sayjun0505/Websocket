import { useSelector } from 'react-redux';
import PinsSidebar from './PinsSidebar';

const CmPinSidebar = (props) => {
  const { messages } = useSelector(({ teamchatApp }) => teamchatApp.channel);

  return <PinsSidebar messages={messages} />;
};

export default CmPinSidebar;
