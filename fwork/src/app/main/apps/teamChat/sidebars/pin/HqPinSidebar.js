import { useSelector } from 'react-redux';

import PinsSidebar from './PinsSidebar';

const HqPinSidebar = (props) => {
  const { messages } = useSelector(({ teamchatApp }) => teamchatApp.hq);

  return <PinsSidebar messages={messages} />;
};

export default HqPinSidebar;
