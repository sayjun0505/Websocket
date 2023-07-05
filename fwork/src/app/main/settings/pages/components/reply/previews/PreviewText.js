import { useEffect, useState } from 'react';
import Linkify from 'react-linkify';

const PreviewText = (props) => {
  const { template } = props;
  const [color, setColor] = useState('#FFFFFF');

  useEffect(() => {
    if (template) {
      // console.log('🤖 [PreviewText] ', template);
    }
  }, [template]);

  if (!template) return null;

  // return null;
  return (
    <div className="flex flex-col w-full items-center">
      <div
        style={{ width: '250px', backgroundColor: '#818cf8', color: '#FFFFFF' }}
        className="rounded p-8"
      >
        <Linkify>
          <span className="break-words whitespace-pre-wrap max-w-full">{template}</span>
        </Linkify>
      </div>
    </div>
  );
};

export default PreviewText;
