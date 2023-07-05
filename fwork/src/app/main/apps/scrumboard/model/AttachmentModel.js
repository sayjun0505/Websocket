import _ from '@lodash';
import getUnixTime from 'date-fns/getUnixTime';

function AttachmentModel(data) {
  data = data || {};

  return _.defaults(data, {
    id: '',
    name: '',
    src: '',
    time: getUnixTime(new Date()),
    type: '',
  });
}
export default AttachmentModel;
