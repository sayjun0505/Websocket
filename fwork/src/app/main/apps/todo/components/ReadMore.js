/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import FuseUtils from '@fuse/utils/FuseUtils';
import { useState } from 'react';

const ReadMore = (props) => {
  const { text, limit } = props;
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  const textMessage = FuseUtils.formatMentionToText(text);
  return (
    <div className="break-all">
      {textMessage.length > Number(limit) ? (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: isReadMore ? textMessage.slice(0, Number(limit)) : textMessage,
            }}
          />
          <div onClick={toggleReadMore} className="text-12 text-blue cursor-pointer">
            {isReadMore ? '...read more' : ' show less'}
          </div>
        </>
      ) : (
        textMessage
      )}
    </div>
  );
};

export default ReadMore;
