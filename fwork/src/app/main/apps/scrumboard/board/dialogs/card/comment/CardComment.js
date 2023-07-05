import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as yup from 'yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { convertToRaw, EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import FuseUtils from '@fuse/utils/FuseUtils';
import { selectUser } from 'app/store/userSlice';
import { ContactAvatar } from 'app/shared-components/chat';
import mentionsStyles from 'app/shared-components/chat/MentionsStyles.module.css';
import { selectMembers } from '../../../../store/membersSlice';
import CommentModel from '../../../../model/CommentModel';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  message: yup.string().required('You must enter a comment'),
});

const defaultValues = {
  idMember: '',
  message: '',
};

const StyledDiv = styled('div')(({ theme, ...props }) => ({
  padding: '9px 16px',
  borderWidth: '2px',
  display: 'flex',
  flexGrow: '1',
  borderRadius: '1.2rem',
  cursor: 'text',
  width: '100%',
  '& .DraftEditor-root': {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    '& .public-DraftEditorPlaceholder-root': {
      color: '#9d9d9d',
      '&.public-DraftEditorPlaceholder-hasFocus': {
        display: 'none',
      },
    },
  },
  '& .DraftEditor-editorContainer': {
    flexGrow: '1',
  },
  '& .public-DraftEditor-content': {
    minHeight: '96px',
  },
}));

const Entry = (props) => {
  const { mention, theme, searchValue, isFocused, ...parentProps } = props;
  return (
    <div {...parentProps}>
      <div className={theme?.mentionSuggestionsEntryContainer}>
        <div className={theme?.mentionSuggestionsEntryContainerLeft}>
          <ContactAvatar contact={mention} className="w-20 h-20" />
        </div>

        <div className={theme?.mentionSuggestionsEntryContainerRight}>
          <div className={theme?.mentionSuggestionsEntryText}>{mention.display}</div>
        </div>
      </div>
    </div>
  );
};

const CardComment = (props) => {
  const ref = useRef(null);
  const loginUser = useSelector(selectUser);
  const members = useSelector(selectMembers);

  const options = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        link: member.email,
        name: member.display,
        avatar: member.photoUrl,
      })),
    [members]
  );

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(options);

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      entityMutability: 'IMMUTABLE',
      theme: mentionsStyles,
      mentionPrefix: '@',
      supportWhitespace: true,
    });
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  // const onChange = useCallback((_editorState) => {
  //   setEditorState(_editorState);
  // }, []);

  const onOpenChange = useCallback((_open) => {
    setOpen(_open);
  }, []);
  const onSearchChange = useCallback(
    ({ value }) => {
      setSuggestions(defaultSuggestionsFilter(value, options));
    },
    [options]
  );

  const { control, formState, handleSubmit, reset, setValue } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    if (loginUser) {
      reset({
        idMember: loginUser.uuid,
        message: '',
      });
    }
  }, [loginUser, reset]);

  function onSubmit(data) {
    props.onCommentAdd(
      CommentModel({
        ...{
          idMember: loginUser.uuid,
          message: '',
        },
        ...data,
      })
    );
    // reset(defaultValues);
    setEditorState(EditorState.createEmpty());
    reset({
      idMember: loginUser.uuid,
      message: '',
    });
  }

  if (!loginUser) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex -mx-8">
      <ContactAvatar className="!w-32 !h-32 mx-8" contact={loginUser.data} />
      <div className="flex flex-col items-start flex-1 mx-8">
        <Controller
          name="message"
          control={control}
          render={({ field: { value, onChange } }) => (
            <StyledDiv
              onClick={() => {
                ref.current.focus();
              }}
            >
              <Editor
                editorKey="editor"
                placeholder="Type your message"
                editorState={editorState}
                onChange={(_editorState) => {
                  setEditorState(_editorState);
                  const data = _editorState.getCurrentContent();
                  const messageText = FuseUtils.formatTextToMention(
                    data.getPlainText(),
                    convertToRaw(data).entityMap
                  );
                  onChange(messageText);
                }}
                plugins={plugins}
                ref={ref}
              />
              <MentionSuggestions
                open={open}
                onOpenChange={onOpenChange}
                suggestions={suggestions}
                onSearchChange={onSearchChange}
                entryComponent={Entry}
                // onAddMention={() => {
                //   // get the mention object selected
                // }}
                // popoverContainer={({ children }) => <div>{children}</div>}
              />
            </StyledDiv>
          )}
        />

        <Button
          className="mt-16"
          aria-label="save"
          variant="contained"
          color="secondary"
          type="submit"
          size="small"
          disabled={_.isEmpty(dirtyFields) || !isValid}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default CardComment;
