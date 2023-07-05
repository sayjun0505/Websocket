import _ from '@lodash';

const CustomerModel = (data) =>
  _.defaults(data || {}, {
    // avatar: null,
    // background: null,
    // name: '',
    // emails: [{ email: '', label: '' }],
    // phoneNumbers: [{ country: 'us', phoneNumber: '', label: '' }],
    // title: '',
    // company: '',
    // birthday: null,
    // address: '',
    // notes: '',
    // tags: [],

    id: null,
    uid: null,
    firstname: '',
    lastname: '',
    display: '',
    picture: '',
    pictureURL: '',
    tel: null,
    email: null,
    remarks: null,
    createdAt: null,
    updatedAt: null,
  });

export default CustomerModel;

// "id": "81b11f3f-1681-4d79-8b76-83934d891d2b",
// "uid": "6265159640223869",
// "firstname": "Timanon",
// "lastname": "Losupanphorn",
// "display": "Losupanphorn",
// "picture": "6265159640223869.jpg",
// "tel": null,
// "email": null,
// "remarks": null,
// "isDelete": false,
// "createdAt": "2021-12-11T23:06:46.754Z",
// "updatedAt": "2021-12-28T02:37:28.879Z",
