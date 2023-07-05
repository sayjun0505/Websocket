import { useEffect, useState } from 'react';

const PreviewImage = (props) => {
  const { template } = props;
  const [color, setColor] = useState('#FFFFFF');

  useEffect(() => {
    if (template) {
      // console.log('🤖 [PreviewImage] ', template);
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
        <img src={template.url} alt={template.id} className="h-auto max-h-xs" />
      </div>
    </div>
  );
};

export default PreviewImage;
