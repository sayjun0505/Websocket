import { Storage } from '@google-cloud/storage'
import axios from 'axios'
import { CHANNEL, ChannelEntity } from '../../model/channel/channel.entity'
import { ReplyEntity } from '../../model/reply/reply.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { OrganizationEntity } from '../../model/organization/organization.entity'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
  },
})

const BUCKET_NAME = process.env.BUCKET

if (!BUCKET_NAME) {
  errorMessage('SERVICE', 'gcs', 'missing google env(bucket name)')
  throw new HttpException(500, ErrorCode[500])
}

const getFileExt = async (mediaObj: any) => {
  switch (mediaObj.contentType) {
    case 'image/jpg':
    case 'image/jpeg':
      return '.jpg'
    case 'image/png':
      return '.png'
    case 'image/gif':
      return '.gif'
    case 'video/mp4':
      return '.mp4'
    default:
      return ''
  }
}

const upload = async (filename: string, content: string | Buffer) => {
  try {
    console.log('💾 upload')
    storage
      .bucket(BUCKET_NAME)
      .file(filename)
      .save(content, (error: any) => {
        console.log('💾 upload: save')
        if (!error) {
          storage.bucket(BUCKET_NAME).file(filename).makePublic()
          console.log('💾 upload make public')
        } else {
          errorMessage('SERVICE', 'gcs', 'Upload file to Google storage', error)
          throw new HttpException(400, ErrorCode[400])
        }
      })
    return await storage.bucket(BUCKET_NAME).file(filename).exists()
  } catch (error) {
    console.error('Upload file to Google storage ', error)
    throw new HttpException(400, ErrorCode[400])
  }
}

export const uploadChatMessageFromFileURL = async (
  organizationId: string,
  channel: ChannelEntity,
  customerId: string,
  filename: string,
  url: string,
) => {
  console.log('💾 uploadChatMessageFromFileURL')
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const mediaObj = {
    contentType: response.headers['content-type'],
    data: response.data,
  }
  const fileExt = await getFileExt(mediaObj)

  if (channel.channel === CHANNEL.INSTAGRAM) {
    await upload(
      `${organizationId}/chat/${channel.id}/message/${customerId}/ig_messaging_cdn/${filename}${fileExt}`,
      mediaObj.data,
    )
  } else {
    await upload(
      `${organizationId}/chat/${channel.id}/message/${customerId}/${filename}${fileExt}`,
      mediaObj.data,
    )
  }

  return `${filename}${fileExt}`
  // const mediaObj = {
  //   contentType: response.headers['content-type'],
  //   data: response.data,
  // }
  // const fileExt = await getFileExt(mediaObj)
  // await upload(
  //   `${organizationId}/chat/${channel.id}/message/${customerId}/${filename}${fileExt}`,
  //   mediaObj.data,
  // )
  // return `${filename}${fileExt}`
}
export const uploadCardAttachmentFromFileObject = async (
  organizationId: string,
  boardId: string,
  cardId: string,
  filename: string,
  mediaObj: any,
) => {
  console.log('💾 uploadCardAttachmentFromFileObject')
  const fileExt = await getFileExt(mediaObj)
  upload(
    `${organizationId}/scrumboard/${boardId}/card/${cardId}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}
export const uploadChatMessageFromFileObject = async (
  organizationId: string,
  channel: ChannelEntity,
  customerId: string,
  filename: string,
  mediaObj: any,
) => {
  console.log('💾 uploadChatMessageFromFileObject')
  const fileExt = await getFileExt(mediaObj)
  if (channel.channel === CHANNEL.INSTAGRAM) {
    await upload(
      `${organizationId}/chat/${channel.id}/message/${customerId}/ig_messaging_cdn/${filename}${fileExt}`,
      mediaObj.data,
    )
  } else {
    upload(
      `${organizationId}/chat/${channel.id}/message/${customerId}/${filename}${fileExt}`,
      mediaObj.data,
    )
  }
  // upload(
  //   `${organizationId}/chat/${channel.id}/message/${customerId}/${filename}${fileExt}`,
  //   mediaObj.data,
  // )
  return `${filename}${fileExt}`
}
export const uploadChatCustomerDisplay = async (
  channelId: string,
  organizationId: string,
  uid: string,
  filename: string,
  url: string,
) => {
  console.log('💾 uploadChatCustomerDisplay')
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })
  const mediaObj = {
    contentType: response.headers['content-type'],
    data: response.data,
  }
  const fileExt = await getFileExt(mediaObj)
  upload(
    `${organizationId}/chat/${channelId}/display/${uid}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}
export const uploadImageReplyTemplate = async (
  replyId: string,
  organizationId: string,
  filename: string,
  mediaObj: any,
) => {
  console.log('💾 uploadImageReplyTemplate')
  const fileExt = await getFileExt(mediaObj)
  const newFilename = Date.now() + '_' + filename
  await upload(
    `${organizationId}/reply/${replyId}/${newFilename}${fileExt}`,
    mediaObj.data,
  )
  return `${newFilename}${fileExt}`
}
export const uploadCommentMessageFromFileObject = async (
  organizationId: string,
  chat: ChatEntity,
  filename: string,
  mediaObj: any,
) => {
  console.log('💾 uploadCommentMessageFromFileObject')
  const fileExt = await getFileExt(mediaObj)
  await upload(
    `${organizationId}/comment/${chat.id}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}

// User profile
export const uploadUserProfileFromFileObject = async (
  userId: string,
  filename: string,
  mediaObj: any,
) => {
  const newFilename = filename + '_' + Date.now()
  const fileExt = await getFileExt(mediaObj)
  await upload(`users/${userId}/${newFilename}${fileExt}`, mediaObj.data)
  return `${newFilename}${fileExt}`
}
export const uploadUserProfileFromURL = async (
  userId: string,
  filename: string,
  url: string,
) => {
  const newFilename = filename + '_' + Date.now()
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const mediaObj = {
    contentType: response.headers['content-type'],
    data: response.data,
  }
  const fileExt = await getFileExt(mediaObj)

  await upload(`users/${userId}/${newFilename}${fileExt}`, mediaObj.data)
  return `${newFilename}${fileExt}`
}

const STORAGE_URL = 'https://storage.googleapis.com'

export const getChatMessageContentURL = (
  organizationId: string,
  channel: ChannelEntity,
  customerId: string,
  filename: string,
) => {
  if (channel.channel === CHANNEL.INSTAGRAM) {
    return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/chat/${channel.id}/message/${customerId}/ig_messaging_cdn/${filename}`
  } else {
    return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/chat/${channel.id}/message/${customerId}/${filename}`
  }
}
export const getCardAttachmentContentURL = (
  organizationId: string,
  boardId: string,
  cardId: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/scrumboard/${boardId}/card/${cardId}/${filename}`
}
export const getCustomerDisplayURL = (
  organizationId: string,
  channelId: string,
  uid: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/chat/${channelId}/display/${uid}/${filename}`
}
export const getReplyContentURL = (
  replyId: string,
  organizationId: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/reply/${replyId}/${filename}`
}
export const getCommentMessageContentURL = (
  organizationId: string,
  chat: ChatEntity,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/comment/${chat.id}/${filename}`
}

export const copyReplyResponseContentToMessage = async (
  organizationId: string,
  channelId: string,
  customerId: string,
  replyId: string,
  filename: string,
) => {
  try {
    storage
      .bucket(`${BUCKET_NAME}`)
      .file(`${organizationId}/reply/${replyId}/${filename}`)
      .copy(
        `${organizationId}/chat/${channelId}/message/${customerId}/${filename}`,
        (err: any) => {
          if (!err) {
            storage
              .bucket(`${BUCKET_NAME}`)
              .file(
                `${organizationId}/chat/${channelId}/message/${customerId}/${filename}`,
              )
              .makePublic()
          } else {
            console.error('Copy file to Google storage ', err)
            throw new HttpException(400, ErrorCode[400])
          }
        },
      )
    await storage
      .bucket(`${BUCKET_NAME}`)
      .file(
        `${organizationId}/chat/${channelId}/message/${customerId}/${filename}`,
      )
      .exists()
  } catch (error) {
    console.error('Copy file to Google storage ', error)
    throw new HttpException(400, ErrorCode[400])
  }
}

// TeamChat
export const uploadTeamChatMessageFromFileObject = async (
  organizationId: string,
  channel: string,
  filename: string,
  mediaObj: any,
) => {
  console.log('💾 uploadTeamChatMessageFromFileObject')
  const fileExt = await getFileExt(mediaObj)
  await upload(
    `${organizationId}/teamChat/${channel}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}

export const getTeamChatMessageContentURL = (
  organizationId: string,
  channelId: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/teamChat/${channelId}/${filename}`
}
export const getDirectMessageContentURL = (
  organizationId: string,
  sendUser: string,
  receiveUser: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/directMessage/${sendUser}/${receiveUser}/${filename}`
}
export const uploadDirectMessageFromFileObject = async (
  organizationId: string,
  sendUser: string,
  receiveUser: string,
  filename: string,
  mediaObj: any,
) => {
  const fileExt = await getFileExt(mediaObj)

  await upload(
    `${organizationId}/directMessage/${sendUser}/${receiveUser}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}
export const uploadTeamChatThreadMessageFromFileObject = async (
  organizationId: string,
  threadId: string,
  filename: string,
  mediaObj: any,
) => {
  const fileExt = await getFileExt(mediaObj)
  await upload(
    `${organizationId}/teamChat/${threadId}/${filename}${fileExt}`,
    mediaObj.data,
  )
  return `${filename}${fileExt}`
}
export const getTeamChatThreadMessageContentURL = (
  organizationId: string,
  threadId: string,
  filename: string,
) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/${organizationId}/teamChat/${threadId}/${filename}`
}

export const getUserProfileURL = (userId: string, filename: string) => {
  return `${STORAGE_URL}/${BUCKET_NAME}/users/${userId}/${filename}`
}

// size
export const getOrganizationBucketSize = async (organizationId: string) => {
  const organizationStorage = await storage.bucket(BUCKET_NAME).getFiles({
    prefix: `${organizationId}/`,
  })
  // let totalSize = 0
  const files = organizationStorage[0]
  const total = await Promise.all(
    files.map(async (file) => {
      return await storage
        .bucket(BUCKET_NAME)
        .file(file.name)
        .getMetadata()
        .then((metadataResults) => {
          const metadata = metadataResults[0]
          // console.log(metadata.size)
          return Number(metadata.size)
        })
        .catch((metadataErr) => {
          console.error(metadataErr)
          return 0
        })
    }),
  )
  return total.reduce((a, b) => a + b, 0)
}
