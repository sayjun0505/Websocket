import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import format from 'date-fns/format';

import { selectChat } from '../../store/chatSlice';
import TicketStatusSetting from '../../chat/settings/TicketStatusSetting';

const Label = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();
  const { mode, id: chatId } = routeParams;

  const chat = useSelector(selectChat);

  const [historySelected, setHistorySelected] = useState();

  useEffect(() => {
    if (chat && chat.history && chat.history.length) {
      setHistorySelected(chat.history.find((element) => element.id === chatId));
    }
  }, [chat, chatId]);

  const handleSelectHistoryChange = (event) => {
    const url = window.location.href;
    if (url.search('history') > -1) navigate(`/apps/chat/${event.target.value.id}`);
    else navigate(`/apps/chat/${event.target.value.id}`);
  };

  if (!chat || !chat.history || !chat.history.length || !historySelected) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center mx-4">
      <TicketStatusSetting className="mb-48" />
      <FormControl variant="filled" className="w-full">
        <InputLabel id="demo-simple-select-filled-label">Ticket</InputLabel>
        <Select
          labelId="demo-simple-select-filled-label "
          id="demo-simple-select-filled"
          value={historySelected}
          defaultValue={historySelected}
          onChange={handleSelectHistoryChange}
          renderValue={(selected) => {
            const optionText = `${
              selected.description ? `${selected.description} - ` : ''
            } ${format(new Date(selected.createdAt), 'PP')}`;
            return <span>{optionText}</span>;
          }}
        >
          {chat.history.map((item, index) => {
            const optionText = `${index + 1} : ${
              item.description ? `${item.description} - ` : ''
            } ${format(new Date(item.createdAt), 'PP')}`;
            return (
              <MenuItem value={item} key={index} disabled={item.id === historySelected.id}>
                {optionText}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default Label;
