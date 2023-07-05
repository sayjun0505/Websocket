
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
apiKey: true,
projectId: true,
messagingSenderId: true,
appId: true,
};

firebase.initializeApp(self.firebaseConfig || defaultConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

const config = self.moreConfig
messaging.onBackgroundMessage(function(payload) {
  // console.log('Received background message ', payload);
  // console.log('frontendURL',config.frontendURL)
  const item = payload.data
  // console.log('item',item)

  const data = JSON.parse(item.data)
  // console.log('data', data)
  // console.log('frontendURL', self.firebaseConfig.frontendURL)

  let title = ''
  let body = ''
  if (item.type === 'chat') {
    title = 'Chat Inbox'
    if (item.event === 'newChat') {
      if (data.customer && data.customer.display) {
        body = `You have a new chat from ${data.customer.display}`;
      } else {
        body = 'You have a new chat';
      }
    } else if (item.event === 'newMessage') {
      const messageCount = (data.newMessage) || 0;
      if (messageCount > 1) {
        if (data.customer && data.customer.display) {
          body  = `You have a ${messageCount} new message from ${data.customer.display}`;
        } else {
          body = `You have a ${messageCount} new message`;
        }
      } else if (data.customer && data.customer.display) {
        body = `You have a new message from ${data.customer.display}`;
      } else {
        body = 'You have a new message';
      }
    } else if (item.event === 'newOwner') {
      if ( data.requester && data.requester.display) {
        body = `You have been assigned to chat ${data.requester.display}`;
      } else {
        body = `You have been assigned to chat`;
      }
    } else if (item.event === 'newMention') {
      if (data.requester && data.requester.display) {
        body = `You have a new mention in chat comment from ${data.requester.display}`;
      } else {
        body = `You have a new mention in chat comment`;
      }
    }
  } else if (item.type === 'teamchat') {
    title = 'Team Chat'
    if (item.event) {
      if (item.event === 'addMember') {
        if (data.requester && data.requester.display) {
          body = `You have been added to channel by ${data.requester.display}`;
        } else {
          body = 'You have been added to channel';
        }
      } else if (item.event === 'newHQMessage') {
        const messageCount = (data.newMessage) || 0;
        if (messageCount > 1) {
          body = `You have a ${messageCount} new message in General Chat`;
        } else {
          body = 'You have a new message in General Chat';
        }
      } else if (item.event === 'newChannelMessage') {
        const messageCount = (data.newMessage) || 0;
        if (messageCount > 1) {
          body = `You have a ${messageCount} new message in Channel`;
        } else {
          body = 'You have a new message in Channel';
        }
      } else if (item.event === 'newDirectMessage') {
        const messageCount = (data.newMessage) || 0;
        if (messageCount > 1) {
          body = `You have a ${messageCount} new direct message`;
        } else {
          body = 'You have a new direct message';
        }
      } else if (item.event === 'newChannelMention') {
        if (data.requester && data.requester.display) {
          body=`You have a new mention in channel from ${data.requester.display}`;
        } else {
          body = `You have a new mention in channel`;
        }
      } else if (item.event === 'newHQMention') {
        if (data.requester && data.requester.display) {
          body = `You have a new mention in General Chat from ${data.requester.display}`;
        } else {
          body = `You have a new mention in General Chat`;
        }
      }  else if (item.event === 'newThread') {
        if (item.data && item.data.requester && item.data.requester.display) {
          if (
            item.data.recordType === 'channel' &&
            item.data.channel &&
            item.data.channel.name
          ) {
            body =
              `<b>${item.data.requester.display}</b> start a thread in
                 <b>${item.data.channel.name}</b>.`
          } else if (
            item.data.recordType === 'directChannel' &&
            item.data.user &&
            item.data.user.display
          ) {
            body = `<b>${item.data.requester.display}</b> start a thread with
                   <b>${item.data.user.display}</b>.`
          } else if (
            item.data.recordType === 'hq' &&
            item.data.organization &&
            item.data.organization.name
          ) {
            body = 
              `<b>${item.data.requester.display}</b> start a thread in
                     <b>General Chat</b>.`
          }
        } else {
          body = 'You have a new thread message'
        }
      } else if (item.event === 'newThreadChannelMessage') {
        const messageCount = (item.data && item.data.newMessage) || 0;
        if (
          item.data &&
          item.data.requester &&
          item.data.requester.display &&
          item.data.channel &&
          item.data.channel.name
        ) {
          body = 
            `New replies in the thread ${
              messageCount > 1 ? `+${messageCount}` : ''
            } in <b>${item.data.channel.name}</b>.`
        } else {
          body = 'You have a new message in thread'
        }
      } else if (item.event === 'newThreadDirectMessage') {
        const messageCount = (item.data && item.data.newMessage) || 0;
        if (
          item.data &&
          item.data.requester &&
          item.data.requester.display &&
          item.data.user &&
          item.data.user.display
        ) {
          body = 
            `New replies in the thread ${
              messageCount > 1 ? `+${messageCount}` : ''
            } with <b>${item.data.user.display}</b>.`
        } else {
          body = 'You have a new message in thread'
        }
      } else if (item.event === 'newThreadHQMessage') {
        const messageCount = (item.data && item.data.newMessage) || 0;
        if (
          item.data &&
          item.data.requester &&
          item.data.requester.display &&
          item.data.organization &&
          item.data.organization.name
        ) {
          body = 
            `New replies in the thread ${
              messageCount > 1 ? `+${messageCount}` : ''
            } in <b>${item.data.organization.name}</b>.`
        } else {
          body = 'You have a new message in thread'
        }
      }
    }
  } else if (item.type === 'scrumboard' || item.type === 'kanbanboard') {
    title = 'Kanban Board'
    if (item.event) {
      if (item.event === 'newCardMember') {
        if (data.requester && data.requester.display) {
          body = `You have been added to card by ${data.requester.display}`;
        } else {
          body = 'You have been added to card';
        }
      } else if (item.event === 'newCardMention') {
        if (data.requester && data.requester.display) {
          body =`You have a new mention in card comment from ${data.requester.display}`;
        } else {
          body = `You have a new mention in card comment`;
        }
      }
    }
  } 
  // console.log('title',title)
  // console.log('body',body)
 // Customize notification here
  const icon = '/logo192.png';
  const notificationTitle = title;
  const notificationOptions = {
    body,
    icon
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});


self.addEventListener('install', event => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.waitUntil(Promise.resolve());
});
