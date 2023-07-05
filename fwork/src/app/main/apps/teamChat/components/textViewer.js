/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Typography } from '@mui/material';
import Linkify from 'react-linkify';
import axios from 'axios';
import { useEffect, useState } from 'react';
import extractUrls from 'extract-urls';
// import { getLinkPreview } from 'link-preview-js';
import FuseUtils from '@fuse/utils/FuseUtils';

const TextViewer = (props) => {
  const { item, reply } = props;
  const [messageObj, setMessageObj] = useState();
  const [text, setText] = useState();
  // const messageObj = JSON.parse(item.data);
  const [viewUrl, setViewUrl] = useState();
  const [viewTitle, setViewTitle] = useState();
  const [viewDescription, setViewDescription] = useState();
  const [viewImage, setViewImage] = useState();
  const [viewDomain, setViewDomain] = useState();

  // const text = FuseUtils.formatMentionToText(messageObj.text);

  useEffect(() => {
    if (item && item.data) {
      setMessageObj(JSON.parse(item.data));
    }
  }, [item]);

  useEffect(() => {
    if (messageObj && messageObj.text) {
      setViewUrl(extractUrls(messageObj.text));
      setText(FuseUtils.formatMentionToText(messageObj.text));
    }
  }, [messageObj]);

  useEffect(() => {
    if (viewUrl) {
      axios
        .get(`https://jsonlink.io/api/extract?url=${viewUrl[0]}`)
        .then((data) => {
          // console.log('🧶 Link meta', data.data);
          setViewTitle(data.data.title);
          setViewDescription(data.data.description);
          setViewImage(data.data.images ? data.data.images[0] : '');
          setViewDomain(data.data.domain);
        })
        .catch((error) => {
          // console.log('🧶 Link meta error', error);
        });
      // setViewDomain(new URL(viewUrl[0]).hostname.replace('www.', ''));
    }
  }, [text, viewUrl]);

  return (
    <div className="w-full">
      {/* <ReactMarkdown>{text}</ReactMarkdown> */}
      {reply ? (
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="blank" href={decoratedHref} key={key} className="!text-cyan-400">
              {decoratedText}
            </a>
          )}
        >
          {/* <p className="break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} /> */}
          <span className="text-12 font-light break-words whitespace-pre-wrap max-w-full !text-[#ffffff]">
            {text}
          </span>
        </Linkify>
      ) : (
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="blank" href={decoratedHref} key={key} className="!text-cyan-400">
              {decoratedText}
            </a>
          )}
        >
          {/* <p className="break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} /> */}
          <span className="break-words whitespace-pre-wrap max-w-full !text-[#ffffff] ">
            {text}
          </span>
        </Linkify>
      )}
      {(viewTitle || viewDescription) && viewDomain && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          className="flex flex-row max-h-96 rounded-8 bg-white cursor-pointer mt-8"
          onClick={() => {
            window.open(viewUrl[0], '_blank', 'noopener,noreferrer');
          }}
        >
          <div className="flex ">
            <img src={viewImage} alt="" className="max-w-96 rounded-l-8" />
          </div>
          <div className="flex flex-col grow items-center p-8 max-w-400">
            <Typography className="flex text-14 font-600 text-black truncate w-full">
              {viewTitle}
            </Typography>
            <Typography className="flex text-12 font-400 line-clamp-2 text-desc w-full place-self-start">
              {viewDescription}
            </Typography>
            <Typography className="flex text-12 font-500 text-black truncate w-full place-self-start pt-5">
              {viewDomain}
            </Typography>
          </div>
          <FuseSvgIcon
            size={20}
            color="action"
            className="flex font-600 m-5 cursor-pointer"
            onClick={() => setViewUrl(false)}
          >
            heroicons-outline:x
          </FuseSvgIcon>
        </div>
      )}
    </div>
  );
};

export default TextViewer;
