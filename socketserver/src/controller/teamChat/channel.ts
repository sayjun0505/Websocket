import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  TeamChatChannelEntity,
  teamChatChannelMemberModel,
  teamChatChannelMessageModel,
  teamChatChannelModel,
  teamChatMentionModel,
} from '../../model/teamChat'
import { notificationUtil } from '../../util'
import { sseController } from '../sse'
import { TeamChatChannelMemberEntity } from '../../model/teamChat/channelMember.entity'
import { TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat/message.entity'
import { gcsService } from '../../service/google'
// import { notificationAddMember } from '../../util/notification'
import member from 'src/api/teamChat/member'

export const getChannels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const myChannelsResult =
      await teamChatChannelMemberModel.getChannelsWithMember(
        requester.id,
        organization,
      )

    const convertChannels = await Promise.all(
      // Convert my channels result
      myChannelsResult.map(async (myChannel) => {
        // order channel message
        myChannel.channel.messages.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
        const lastMessageObj =
          myChannel.channel.messages.length > 0
            ? myChannel.channel.messages[myChannel.channel.messages.length - 1]
            : null

        let lastMessageText = ''
        if (lastMessageObj) {
          if (lastMessageObj.type === 'text') {
            lastMessageText = JSON.parse(lastMessageObj.data).text
          } else {
            lastMessageText = `${
              lastMessageObj.type === TEAMCHAT_MESSAGE_TYPE.FILE
                ? 'document'
                : lastMessageObj.type
            } file`
          }
        }

        let unread = 0
        const channelReadLastest =
          await teamChatMentionModel.getChannelReadLastest(
            requester.id,
            myChannel.channelId,
            organization,
          )
        if (!channelReadLastest) {
          unread = await teamChatMentionModel.countChannelReadAfterDateTime(
            requester.createdAt,
            myChannel.channelId,
            organization,
          )
        } else {
          unread = await teamChatMentionModel.countChannelReadAfterDateTime(
            channelReadLastest.readAt,
            myChannel.channelId,
            organization,
          )
        }

        // need to dev
        return {
          id: myChannel.channelId,
          channelId: myChannel.channelId,
          name: myChannel.channel.name,
          isPublic: myChannel.channel.isPublic,
          description: myChannel.channel.description,
          createdAt: lastMessageObj ? lastMessageObj.createdAt : null,
          lastMessage: lastMessageText,
          unread,
        }
      }),
    )

    const myPublicChannelsResult = await teamChatChannelModel.getPublicChannels(
      organization,
    )
    const convertPublicChannels = await Promise.all(
      myPublicChannelsResult.map(async (myPublicChannel) => {
        // order channel message
        myPublicChannel.messages.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
        const lastMessageObj =
          myPublicChannel.messages.length > 0
            ? myPublicChannel.messages[myPublicChannel.messages.length - 1]
            : null

        let lastMessageText = ''
        if (lastMessageObj) {
          if (lastMessageObj.type === 'text') {
            lastMessageText = JSON.parse(lastMessageObj.data).text
          } else {
            lastMessageText = `${
              lastMessageObj.type === TEAMCHAT_MESSAGE_TYPE.FILE
                ? 'document'
                : lastMessageObj.type
            } file`
          }
        }

        let unread = 0
        const channelReadLastest =
          await teamChatMentionModel.getChannelReadLastest(
            requester.id,
            myPublicChannel.id,
            organization,
          )
        if (!channelReadLastest) {
          unread = await teamChatMentionModel.countChannelReadAfterDateTime(
            requester.createdAt,
            myPublicChannel.id,
            organization,
          )
        } else {
          unread = await teamChatMentionModel.countChannelReadAfterDateTime(
            channelReadLastest.readAt,
            myPublicChannel.id,
            organization,
          )
        }

        // need to dev
        return {
          id: myPublicChannel.id,
          channelId: myPublicChannel.id,
          name: myPublicChannel.name,
          isPublic: myPublicChannel.isPublic,
          description: myPublicChannel.description,
          createdAt: lastMessageObj ? lastMessageObj.createdAt : null,
          lastMessage: lastMessageText,
          unread,
        }
      }),
    )

    return res.status(200).send(
      [...convertChannels, ...convertPublicChannels].sort((a, b) => {
        return a && a.createdAt && b.createdAt && b
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : 0
      }),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_channel', 'getChannels', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'channel', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await teamChatChannelModel.getChannelWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'channel not found')
      return next(new HttpException(404, 'channel not found'))
    }

    // const url = await gcsService.getTeamChatMessageContentURL(
    //   organization.id,
    //   channel,
    //   contentName,
    // )
    // ({
    //   data: msg.data,
    //   // isPin: msg.isPin,
    //   type: msg.type,
    //   createdAt: msg.createdAt,
    //   createdBy: {
    //     id: msg.createdBy.id,
    //     display: msg.createdBy.display,
    //     picture: msg.createdBy.picture,
    //   },
    // })
    await teamChatMentionModel.markRead(requester.id, id, organization)

    const messages = await Promise.all(
      result.messages.map(async (msg) => {
        if (
          msg.type === TEAMCHAT_MESSAGE_TYPE.IMAGE ||
          msg.type === TEAMCHAT_MESSAGE_TYPE.AUDIO ||
          msg.type === TEAMCHAT_MESSAGE_TYPE.FILE ||
          msg.type === TEAMCHAT_MESSAGE_TYPE.VIDEO
        ) {
          // convert url
          const url = await gcsService.getTeamChatMessageContentURL(
            organization.id,
            id,
            JSON.parse(msg.data).filename,
          )
          msg.data = JSON.stringify({ url })
        }

        return {
          id: msg.id,
          data: msg.data,
          isPin: msg.isPin,
          isEdit: msg.isEdit,
          isDelete: msg.isDelete,
          isReply: msg.isReply,
          type: msg.type,
          createdAt: msg.createdAt,
          createdBy: {
            id: msg.createdBy.id,
            display: msg.createdBy.display,
            picture: msg.createdBy.picture,
            pictureURL:
              msg.createdBy.picture &&
              JSON.parse(msg.createdBy.picture) &&
              JSON.parse(msg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    msg.createdBy.id,
                    JSON.parse(msg.createdBy.picture).filename,
                  )
                : '',
          },
        }
      }),
    )
    messages.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    return res.status(200).send({
      ...result,
      messages,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let channel = req.body.channel
    if (typeof channel === 'string') {
      channel = JSON.parse(channel)
    }
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    if (channel.name === null && channel.name === '') {
      errorMessage('CONTROLLER', 'channel', 'channel name required')
      return next(new HttpException(500, 'channel name required'))
    }
    const isExisted = await teamChatChannelModel.getChannelWithName(
      channel.name,
      organization,
    )
    if (isExisted) {
      errorMessage('CONTROLLER', 'channel', 'already channel exist')
      return next(new HttpException(500, 'already channel exist'))
    } else {
      // Save channel to database
      let members = channel.members
      if (typeof members === 'string') {
        members = JSON.parse(members)
      }
      delete channel.members
      const newChannel: TeamChatChannelEntity = {
        ...channel,
        organization,
        createdBy: requester,
      }
      const result = await teamChatChannelModel.saveChannel(newChannel)
      // real time channel list
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ event: 'channel created' })),
      )
      // Add labels to database
      const newMembers = members.map((member: { userId: any }) => {
        return {
          ...new TeamChatChannelMemberEntity(),
          channelId: result.id,
          memberId: member.userId,
          createdBy: requester.id,
        }
      })
      return res
        .status(201)
        .send(await teamChatChannelMemberModel.saveMembers(newMembers))
      // return res.status(201).send(result)
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let channel = req.body.channel
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    if (typeof channel === 'string') {
      channel = JSON.parse(channel)
    }

    if (channel.name === null && channel.name === '') {
      errorMessage('CONTROLLER', 'teamchat_channel', 'channel name required')
      return next(new HttpException(400, 'channel name required'))
    } else {
      // update Channel
      const newChannel: TeamChatChannelEntity = {
        // ...channel,
        ...new TeamChatChannelEntity(),
        id: channel.id,
        name: channel.name,
        isPublic: channel.isPublic,
        description: channel.description,
        organization,
        updatedBy: requester,
        isDelete: false,
      }
      // console.log('Update Members >>>', newChannel)
      const result = await teamChatChannelModel.saveChannel(newChannel)

      // Add members to database
      const currentMember = await teamChatChannelMemberModel.getChannelMembers(
        channel.id,
      )
      const newMembers: TeamChatChannelMemberEntity[] = []
      let members = channel.members
      if (typeof members === 'string') {
        members = JSON.parse(members)
      }
      members.forEach((member: any) => {
        let memberData
        if (typeof member === 'string') {
          memberData = JSON.parse(member)
        } else {
          memberData = member
        }
        if (memberData.userId && memberData.userId !== '') {
          const newMember = new TeamChatChannelMemberEntity()
          newMember.channelId = channel.id
          newMember.memberId = memberData.userId
          newMember.createdBy = requester.id
          newMembers.push(newMember)
        }
      })
      await teamChatChannelMemberModel.saveMembers(newMembers)
      if (newMembers.length > 0) {
        const newMemberIds = newMembers
          .filter(
            (element: TeamChatChannelMemberEntity) =>
              !currentMember.some(
                (current) => element.memberId === current.memberId,
              ),
          )
          .map((e) => e.memberId)
        if (newMemberIds.length > 0) {
          notificationUtil.teamchat.notificationAddMember(
            newMemberIds,
            channel,
            organization,
            requester.id,
          )
        }
      }

      // real time channel list
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ updatedChannelId: channel.id })),
      )
      // return res
      //   .status(201)
      //   .send(await channelMemberModel.saveMembers(newMembers))

      return res.status(201).send(result)
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'channel', 'invalid parameter(id)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const channelResult = await teamChatChannelModel.getChannelWithId(
      id,
      organization,
    )
    if (!channelResult) {
      errorMessage('CONTROLLER', 'channel', ' channel not found')
      return next(new HttpException(404, 'channel not found'))
    }
    // Save channel to database
    const newChannel: TeamChatChannelEntity = {
      ...channelResult,
      isDelete: true,
      updatedBy: requester,
    }
    return res
      .status(201)
      .send(await teamChatChannelModel.saveChannel(newChannel))
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'deleteChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
