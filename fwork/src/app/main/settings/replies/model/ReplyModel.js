import _ from '@lodash';

const ReplyModel = (data) =>
  _.defaults(data || {}, {
    name: '',
    type: 'auto',
    event: 'response',
    status: 'active',
    keyword: [],
    response: [
      {
        data: JSON.stringify({ text: '' }),
        channel: 'default',
        type: 'text',
        order: 1,
      },
    ],
  });

export default ReplyModel;
