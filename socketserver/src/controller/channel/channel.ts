import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  UserEntity,
  userModel,
} from '../../model/organization'

import {
  CHANNEL,
  ChannelEntity,
  channelModel,
  CHANNEL_STATUS,
  facebookModel,
  lineModel,
} from '../../model/channel'
import * as channelService from '../../service/channel'
import user from 'src/api/user/user'
export const getChannelsforSocket = async (
  org: string,
) => {
  try {
    const _channels = await channelModel.getChannelsforSocket(org)
    if (!_channels) {
      errorMessage('CONTROLLER', 'channel', 'get channels')
      return "error500";
    }
    return _channels.map((channel) => {
              const channelData: any =
                channel.facebook || channel.line || channel.instagram
              return {
                id: channel.id,
                channel: channel.channel,
                data: {
                  name: channelData.name,
                  pageId: channelData.pageId,
                  channelSecret: channelData.channelSecret,
                },
              }
            })
    
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannels', error)
    return "error500"
  }
}
export const getChannels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const _channels = await channelModel.getChannels(organization)
    if (!_channels) {
      errorMessage('CONTROLLER', 'channel', 'get channels')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(
      _channels.map((channel) => {
        const channelData: any =
          channel.facebook || channel.line || channel.instagram
        return {
          id: channel.id,
          channel: channel.channel,
          data: {
            name: channelData.name,
            pageId: channelData.pageId,
            channelSecret: channelData.channelSecret,
          },
        }
      }),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannels', error)
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

    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'channel', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await channelModel.getChannelWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'channel not found')
      return next(new HttpException(404, 'channel not found'))
    }
    // return res.status(200).send(result)
    const channelData: any = result.facebook || result.line || result.instagram

    // console.log('channelData ', channelData)

    const _createdBy = result.updatedBy || result.createdBy
    return res.status(201).send({
      id: result.id,
      channel: result.channel,
      createdAt: result.updatedAt || result.createdAt,
      createdBy: {
        id: _createdBy.id,
        display: _createdBy.display,
        picture: _createdBy.picture,
      },
      data: {
        name: channelData.name,
        pageId: channelData.pageId,
        accessToken: channelData.accessToken,
        channelSecret: channelData.channelSecret,
      },
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

  let channel: ChannelEntity
  if (typeof req.body.channel === 'string') {
    channel = JSON.parse(req.body.channel)
  }else {
    channel = req.body.channel
  }
  if (!channel) {
    errorMessage('CONTROLLER', 'channel', 'invalid data(channel)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  if (!Object.values(CHANNEL).includes(channel.channel)) {
    errorMessage('CONTROLLER', 'channel', 'invalid data(CHANNEL)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  try {
    if (channel.channel === CHANNEL.LINE && channel.line) {
      const currentLineChannel = await channelModel.getAlreadyLINEChannel(
        channel.line.channelSecret,
      )
      if (currentLineChannel) {
        return res.status(400).send({
          message: 'This channel is already in different organization.',
        })
      } else {
        channel.line.createdBy = requester
        channel.line.organization = organization
      }
      // const oldLineChannel = await channelModel.getDeleteLineChannelWithChannelSecret(channel.line.channelSecret)
      // if (oldLineChannel) {
      //   channel.id = oldLineChannel.id
      //   channel.line.id = oldLineChannel.line.id
      //   channel.line.createdBy = requester
      //   channel.line.updatedBy = requester
      //   channel.line.organization = organization
      //   lineModel.saveLineChannel(channel.line)
      //   return res.status(201).send(channelModel.saveChannel({
      //     id: oldLineChannel.id,
      //     status:CHANNEL_STATUS.ACTIVE,
      //     isDelete: false,
      //   } as ChannelEntity))
      // }else{
      // }
    }
    if (channel.channel === CHANNEL.FACEBOOK && channel.facebook) {
      const currentFacebookChannel =
        await channelModel.getAlreadyFacebookChannel(channel.facebook.pageId)
      if (currentFacebookChannel) {
        return res.status(400).send({
          message: 'This channel is already in different organization.',
        })
      } else {
        channel.facebook.createdBy = requester
        channel.facebook.organization = organization
      }
    }
    if (channel.channel === CHANNEL.INSTAGRAM && channel.instagram) {
      const currentInstagramChannel =
        await channelModel.getAlreadyInstagramChannel(channel.instagram.pageId)
      if (currentInstagramChannel) {
        return res.status(400).send({
          message: 'This channel is already in different organization.',
        })
      } else {
        channel.instagram.createdBy = requester
        channel.instagram.organization = organization
      }
    }
    // Add channel to database
    const newChannel: ChannelEntity = {
      ...channel,
      organization,
      createdBy: requester,
    }
    const saveChannelResult = await channelModel.saveChannel(newChannel)
    if (saveChannelResult.channel === CHANNEL.LINE && saveChannelResult.line) {
      channelService.lineService.setWebhook(saveChannelResult)
    }

    // return res.status(201).send(saveChannelResult)
    const channelData: any =
      saveChannelResult.facebook ||
      saveChannelResult.line ||
      saveChannelResult.instagram
    return res.status(201).send({
      id: saveChannelResult.id,
      channel: saveChannelResult.channel,
      data: {
        name: channelData.name,
        pageId: channelData.pageId,
        channelSecret: channelData.channelSecret,
      },
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'createChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { channel } = req.body

  if (typeof channel === 'string') {
    channel = JSON.parse(channel);
  }

  if (!channel || !channel.id) {
    errorMessage('CONTROLLER', 'channel', 'invalid data(channel)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  if (!Object.values(CHANNEL).includes(channel.channel)) {
    errorMessage('CONTROLLER', 'channel', 'invalid data(CHANNEL)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  if (channel.channel === CHANNEL.LINE && channel.line) {
    channel.line.updatedBy = requester
  }
  if (channel.channel === CHANNEL.FACEBOOK && channel.facebook) {
    channel.facebook.updatedBy = requester
  }

  try {
    // Save channel to database
    const newChannel: ChannelEntity = {
      ...channel,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await channelModel.saveChannel(newChannel))
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'updateChannel', error)
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
    const channelResult = await channelModel.getChannelWithId(id, organization)
    if (!channelResult) {
      errorMessage('CONTROLLER', 'channel', ' channel not found')
      return next(new HttpException(404, 'channel not found'))
    }
    // Save channel to database
    const newChannel: ChannelEntity = {
      ...channelResult,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await channelModel.saveChannel(newChannel))
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'deleteChannel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const exchangeAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken } = req.params
    if (!accessToken || typeof accessToken !== 'string') {
      errorMessage('CONTROLLER', 'channel', 'invalid parameter(accessToken)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const longLiveAccessToken =
      await channelService.facebookService.getLongLivedAccessToken(accessToken)
    if (!longLiveAccessToken || !longLiveAccessToken.access_token) {
      errorMessage('CONTROLLER', 'channel', 'exchangeAccessToken')
      return next(new HttpException(500, 'exchange token fail'))
    }

    // userModel.saveUser({
    //   ...requester,
    //   facebookToken:longLiveAccessToken.access_token
    // })

    return res.status(200).send(longLiveAccessToken)
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'exchangeAccessToken', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
