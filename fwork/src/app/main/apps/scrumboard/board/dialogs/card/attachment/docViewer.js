import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const DocViewer = (props) => {
  const { src, fileExt } = props;
  if (!src) return null;

  return (
    <div className="block">
      {fileExt === 'pdf' && (
        <a href={src} target="_blank" rel="noreferrer">
          <FuseSvgIcon size={100} color="action" className="flex flex-col">
            heroicons-outline:document-text
          </FuseSvgIcon>
        </a>
      )}
      {(fileExt === 'doc' || fileExt === 'docx') && (
        <a
          href={`http://docs.google.com/gview?url=${src}&embedded=true`}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer"
        >
          <FuseSvgIcon size={100} color="action" className="flex flex-col">
            heroicons-outline:document-text
          </FuseSvgIcon>
        </a>
      )}
    </div>
  );
};

export default DocViewer;
