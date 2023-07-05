import { v4 as uuidv4 } from 'uuid';
import _ from '@lodash';

const ReplyModel = (data) =>
  _.defaults(data || {}, {
    id: uuidv4(),
    name: '',
    type: 'auto',
    event: 'response',
    status: 'active',
    keyword: [],
    response: [
      {
        data: null,
        channel: 'default',
        type: 'text',
        order: 1,
      },
    ],
  });

export default ReplyModel;
