import { useCallback, useMemo, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Editor from '@draft-js-plugins/editor';
import { EditorState } from 'draft-js';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
// import editorStyles from './SimpleMentionEditor.module.css';
import mentionsStyles from './MentionsStyles.module.css';
import ContactAvatar from './ContactAvatar';

const all = { name: 'all', display: 'all', link: 'all' };

const StyledDiv = styled('div')(({ theme, ...props }) => ({
  padding: '9px 16px',
  borderWidth: '2px',
  display: 'flex',
  flexGrow: '1',
  borderRadius: '1.2rem',
  cursor: 'text',
  minWidth: 0,
  // whiteSpace: 'pre-wrap',
  // overflowWrap: 'break-word',
  '& .DraftEditor-root': {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    width: '100%',
    '& .DraftEditor-editorContainer': {
      width: '100%',
      flexGrow: '1',
    },
    '& .public-DraftEditorPlaceholder-root': {
      position: 'absolute',
      color: '#9d9d9d',
      // '&.public-DraftEditorPlaceholder-hasFocus': {
      //   display: 'none',
      // },
    },
  },
}));

const Entry = (props) => {
  const { mention, theme, searchValue, isFocused, ...parentProps } = props;
  return (
    <div {...parentProps}>
      <div className={theme?.mentionSuggestionsEntryContainer}>
        <div className={theme?.mentionSuggestionsEntryContainerLeft}>
          {mention.display === 'all' ? (
            <Avatar className="w-20 h-20">
              <FuseSvgIcon className="text-48" size={20} color="white">
                heroicons-outline:user-group
              </FuseSvgIcon>
            </Avatar>
          ) : (
            <ContactAvatar contact={mention} className="w-20 h-20" />
          )}
        </div>

        <div className={theme?.mentionSuggestionsEntryContainerRight}>
          <div className={theme?.mentionSuggestionsEntryText}>{mention.display}</div>
        </div>
      </div>
    </div>
  );
};

const MentionEditor = ({ editorState, setEditorState, onMessageSubmit, options, className }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([all, ...options]);

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

  const onChange = useCallback((_editorState) => {
    // setEditorState(
    //   !_editorState.getSelection().getHasFocus()
    //     ? EditorState.moveFocusToEnd(_editorState)
    //     : _editorState
    // );
    setEditorState(_editorState);
  }, []);

  const onOpenChange = useCallback((_open) => {
    setOpen(_open);
  }, []);
  const onSearchChange = useCallback(
    ({ value }) => {
      setSuggestions(defaultSuggestionsFilter(value, [all, ...options]));
    },
    [options]
  );

  function onEnterPress(e) {
    if (e.keyCode === 13 && e.shiftKey === false && !open) {
      e.preventDefault();
      onMessageSubmit(e);
      setEditorState(EditorState.createEmpty());
    }
  }

  return (
    <StyledDiv
      className={className}
      onClick={() => {
        ref.current.focus();
      }}
      onKeyDown={onEnterPress}
    >
      <Editor
        editorKey="editor"
        placeholder="Type your message"
        editorState={editorState}
        onChange={onChange}
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
  );
};

export default MentionEditor;
