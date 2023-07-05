/* eslint-disable no-undef */
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Typography } from '@mui/material';
import axios from 'axios';
import fileDownload from 'js-file-download';

const FileViewer = (props) => {
  const { item } = props;
  const messageObj = JSON.parse(item.data);
  // console.log("🚀 ~ file: fileViewer.js:10 ~ FileViewer ~ messageObj", messageObj)
  const fileTitle = messageObj.url.substring(messageObj.url.lastIndexOf('/') + 1);
  const exp = messageObj.url.substring(messageObj.url.lastIndexOf('.') + 1);
  const handleDownload = (url, filename) => {
    axios
      .get(url, {
        responseType: 'blob',
      })
      .then((res) => {
        fileDownload(res.data, filename);
      });
  };

  return (
    <div className="flex flex-col">
      {exp === 'pdf' && (
        <div className="flex justify-between items-center bg-gray-100 rounded-8 p-8">
          <FuseSvgIcon size={24} color="action" className="flex flex-col">
            heroicons-outline:document-text
          </FuseSvgIcon>
          <Typography className="text-14 px-10 flex flex-col flex-auto text-black cursor-pointer">
            <a
              href={messageObj.url}
              target="_blank"
              rel="noreferrer"
              className="!bg-gray-100 no-underline"
            >
              {fileTitle}
            </a>
          </Typography>
          <FuseSvgIcon
            size={24}
            color="action"
            className="flex flex-col cursor-pointer hover:bg-[#eeeeee] hover:rounded-lg !bg-gray-100"
            onClick={handleDownload(messageObj.url, fileTitle)}
          >
            heroicons-outline:download
          </FuseSvgIcon>
        </div>
      )}
      {(exp === 'doc' || exp === 'docx') && (
        <div className="flex justify-between items-center bg-gray-100 rounded-8 p-8">
          <FuseSvgIcon size={24} color="action" className="flex flex-col">
            heroicons-outline:document-text
          </FuseSvgIcon>
          <Typography className="text-14 px-10 flex flex-col flex-auto text-black cursor-pointer">
            <a
              href={`http://docs.google.com/gview?url=${messageObj.url}&embedded=true`}
              target="_blank"
              rel="noreferrer"
              className="!bg-gray-100 no-underline"
            >
              {fileTitle}
            </a>
          </Typography>
          <a
            href={messageObj.url}
            download
            target="_blank"
            rel="noreferrer"
            className="!bg-gray-100 no-underline"
          >
            <FuseSvgIcon
              size={24}
              color="action"
              className="flex flex-col cursor-pointer hover:bg-[#eeeeee] hover:rounded-lg "
            >
              heroicons-outline:download
            </FuseSvgIcon>
          </a>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
