import e, { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationUserModel,
  UserEntity,
  userModel,
  organizationModel,
} from '../../model/organization'

import { Between, getRepository, LessThan, MoreThan, Not, UpdateValuesMissingError } from 'typeorm'
import { ChatCommentEntity, ChatEntity, CHAT_COMMENT_TYPE, CHAT_STATUS, MessageEntity } from '../../model/chat'
import { OrganizationUserEntity } from '../../model/organization/organizationUser.entity'
import { teamChatChannelMemberModel, TeamChatHQMessageEntity, teamChatHQMessageModel, teamChatMentionModel, TEAMCHAT_HQ_MESSAGE_TYPE, TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat'
import { gcsService } from '../../service/google'
import { ScrumboardBoardModel, ScrumboardCardModel } from '../../model/scrumboard'
import { cardController } from '../scrumboard'
import { identity } from 'lodash'
import { taskModel } from '../../model/tasks'
import { CustomerEntity } from '../../model/customer'

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const userList = await organizationUserModel.getUsers(organization.id)

    // Get All Chat
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date()
    yesterday.setHours(0, 0, 0, 0)
    yesterday.setDate(yesterday.getDate() - 1)

    // let i = 0
    // const dateAgo = new Date()
    // dateAgo.setHours(0, 0, 0, 0)
    // if (dateAgo.getDay() !== 0) {
    //   dateAgo.setDate(dateAgo.getDate() - dateAgo.getDay() + i + 1)
    // }
    // dateAgo.setDate(dateAgo.getDate() - 6 + i)

    // const date = new Date()
    // date.setHours(0, 0, 0, 0)
    // if (date.getDay() !== 0) {
    //   date.setDate(date.getDate() - date.getDay() + i + 2)
    // }
    // date.setDate(date.getDate() - 5 + i)

    const thisWeek = new Date()
    thisWeek.setHours(0, 0, 0, 0)
    if (thisWeek.getDay() !== 0) {
      thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 1)
    }
    thisWeek.setDate(thisWeek.getDate() - 6)

    const lastWeek = new Date()
    lastWeek.setHours(0, 0, 0, 0)
    if (lastWeek.getDay() !== 0) {
      lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 6)
    }
    lastWeek.setDate(lastWeek.getDate() - 13)

    const yesterdayAllChat = await getRepository(ChatEntity).count({
      where: {
        organization,
        createdAt: Between(yesterday, today),
      },
    })
    const todayAllChat = await getRepository(ChatEntity).count({
      where: {
        organization,
        createdAt: MoreThan(today),
      },
    })
    const allChat = {
      currentRange: 'DT',
      data: {
        count: {
          DT: todayAllChat,
          DY: yesterdayAllChat,
        },
      },
      ranges: {
        DT: 'Today',
        DY: 'Yesterday',
      },
    }

    // Get Open Chat
    const openChat = await getRepository(ChatEntity).count({
      where: {
        organization,
        status: CHAT_STATUS.OPEN,
      },
    })

    // Get Resoved Chats
    const resovedChats = await getRepository(ChatEntity).count({
      where: {
        organization,
        status: CHAT_STATUS.RESOLVED,
      },
    })

    // Get Today Message
    // const date = new Date()
    // date.setHours(0, 0, 0, 0)
    // date.setDate(date.getDate() - 1)
    const todayMessage = await getRepository(MessageEntity).count({
      where: {
        organization,
        createdAt: MoreThan(today),
      },
    })
    // Get Inbox Summary
    // Get Inbox Summary/resolvedChats
    const WTResolvedChats = await getRepository(ChatEntity).find({
      where: {
        status: CHAT_STATUS.RESOLVED,
        isDelete: false,
        organization,
        createdAt: MoreThan(thisWeek),
      },
    })
    const WTresolvedDates = WTResolvedChats.map((rChat) => {
      return rChat.createdAt.setHours(0, 0, 0, 0)
    })
    const WTlineChartObj = WTresolvedDates.reduce(function (prev: any, cur) {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})
    const WTlineChart = Object.keys(WTlineChartObj).map(function (key) {
      return [Number(key), WTlineChartObj[key]]
    })

    const WLResolvedChats = await getRepository(ChatEntity).find({
      where: {
        status: CHAT_STATUS.RESOLVED,
        isDelete: false,
        organization,
        createdAt: Between(lastWeek, thisWeek),
      },
    })
    const WLresolvedDates = WLResolvedChats.map((rChat) => {
      return rChat.createdAt.setHours(0, 0, 0, 0)
    })
    const WLlineChartObj = WLresolvedDates.reduce(function (prev: any, cur) {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})
    const WLlineChart = Object.keys(WLlineChartObj).map(function (key) {
      return [Number(key), WLlineChartObj[key]]
    })
    // const countResolvedChat = Resolvedchats.filter((rChat) => {
    //   rChat.createdAt.setHours(0,0,0,0) === date
    // })
    // let WTdayResolvedchats: any[] = []
    // for (let i = 0; i < 7; i++) {
    //   const WTdayResolvedchat = await getRepository(ChatEntity).count({
    //     where: {
    //       status: CHAT_STATUS.RESOLVED,
    //       isDelete: false,
    //       organization,
    //       createdAt: Between(dateAgo, date),
    //     },
    //   })
    //   if(WTdayResolvedchat) WTdayResolvedchats.push(WTdayResolvedchat)
    // }

    // let WLdayResolvedchats: any[] = []
    // for (let i = 0; i < 6; i++) {
    //   const WLdayResolvedchat = await getRepository(ChatEntity).count({
    //     where: {
    //       status: CHAT_STATUS.RESOLVED,
    //       isDelete: false,
    //       organization,
    //       createdAt: Between(dateAgo, date),
    //     },
    //   })
    //   if(WLdayResolvedchat) WLdayResolvedchats.push(WLdayResolvedchat)
    // }

    //Get Inbox Summary/activedChats
    const WTActivedChats = await getRepository(ChatEntity).find({
      where: {
        status: Not(CHAT_STATUS.RESOLVED),
        isDelete: false,
        organization,
        createdAt: MoreThan(thisWeek),
      },
    })
    const WTactivedDates = WTActivedChats.map((aChat) => {
      return aChat.createdAt.setHours(0, 0, 0, 0)
    })
    const WTcolumnChartObj = WTactivedDates.reduce(function (prev: any, cur) {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})
    const WTcolumnChart = Object.keys(WTcolumnChartObj).map(function (key) {
      return [Number(key), WTcolumnChartObj[key]]
    })

    const WLActivedChats = await getRepository(ChatEntity).find({
      where: {
        status: Not(CHAT_STATUS.RESOLVED),
        isDelete: false,
        organization,
        createdAt: Between(lastWeek, thisWeek),
      },
    })
    const WLactivedDates = WLActivedChats.map((aChat) => {
      return aChat.createdAt.setHours(0, 0, 0, 0)
    })
    const WLcolumnChartObj = WLactivedDates.reduce(function (prev: any, cur) {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})
    const WLcolumnChart = Object.keys(WLcolumnChartObj).map(function (key) {
      return [Number(key), WLcolumnChartObj[key]]
    })
    // const columnChart = [WTcolumnChart, WLcolumnChart]
    // let WTdayActivedChats: any[] = []
    // for (let i = 0; i < 6; i++) {
    //   if (date.getDate() - date.getDay() >= 0) {
    //     return null;
    //   }
    //   const WTdayActivedChat = await getRepository(ChatEntity).count({
    //     where: {
    //       status: Not(CHAT_STATUS.RESOLVED),
    //       isDelete: false,
    //       organization,
    //       createdAt: Between(dateAgo, date),
    //     },
    //   })
    //   if(WTdayActivedChat) WTdayActivedChats.push(WTdayActivedChat)
    // }

    // let WLdayActivedChats: any[] = []
    // for (let i = 0; i < 6; i++) {
    //   const WLdayActivedChat = await getRepository(ChatEntity).count({
    //     where: {
    //       status: Not(CHAT_STATUS.RESOLVED),
    //       isDelete: false,
    //       organization,
    //       createdAt: Between(dateAgo, date),
    //     },
    //   })
    //   if(WLdayActivedChat) WLdayActivedChats.push(WLdayActivedChat)
    // }

    // Get InboxSummary/overview-All Message
    const thisWeekAllMessage = await getRepository(MessageEntity).count({
      where: {
        organization,
        createdAt: MoreThan(thisWeek),
      },
    })
    const lastWeekAllMessage = await getRepository(MessageEntity).count({
      where: {
        organization,
        createdAt: Between(lastWeek, thisWeek),
      },
    })

    const inboxSummary = {
      overview: {
        wt: thisWeekAllMessage,
        wl: lastWeekAllMessage,
      },
      ranges: {
        wt: 'This Week',
        wl: 'Last Week',
      },
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: {
        wt: [
          {
            name: 'Resolved Chat',
            type: 'line',
            data: WTlineChart,
          },
          {
            name: 'Actived Chat',
            type: 'column',
            data: WTcolumnChart,
          },
        ],
        wl: [
          {
            name: 'Resolved Chat',
            type: 'line',
            data: WLlineChart,
          },
          {
            name: 'Actived Chat',
            type: 'column',
            data: WLcolumnChart,
          },
        ],
      },
    }

    // Get Total customer
    const TotalCustomer = await getRepository(CustomerEntity).count({
      where: {
        isDelete: false,
        organization,
      },
    })

    //Get Chat HQ
    const HqMessageUsers = await Promise.all(
      userList.map(async (user) => {
        let lastMessageText = ''
        let lastMessageAt = null

        const hqLastMessages =
          await teamChatHQMessageModel.getLastHQMessagesWithOrganizationId_UserId(
            organization.id,
            user.userId,
          )
        if (hqLastMessages) {
          if (hqLastMessages.type === 'text') {
            lastMessageText = JSON.parse(hqLastMessages.data).text
          } else {
            lastMessageText = `${hqLastMessages.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE
                ? 'document'
                : hqLastMessages.type
              } file`
          }
          lastMessageAt = hqLastMessages.createdAt
        }

        return {
          id: hqLastMessages
            ? hqLastMessages.id
            : user.user.id,
          userId: user.userId,
          email: user.user.email,
          display: user.user.display,
          picture: user.user.picture,
          isOnline: user.user.isOnline,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : undefined,
          createdAt: hqLastMessages
            ? hqLastMessages.createdAt
            : user.user.createdAt,
          lastMessage: lastMessageText,
        }
      }),
    )
    // const hqUserList = HqMessageUsers.filter((user) => {
    //   return user.userId !== requester.id
    // })
    HqMessageUsers.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    const dashboardHqUserList = [...HqMessageUsers.slice(0, 5)]

    //Get Comments
    let commentsMessageList = await getRepository(ChatCommentEntity).find({
      where: {
        organization,
      },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    })

    // Filter duplicate comments
    commentsMessageList = commentsMessageList.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.chatId === value.chatId),
    )

    const commentsList = commentsMessageList.map((msg) => {
      let lastCommentText = ''
      let lastCommentAt = null
      if (msg) {
        if (msg.type === 'text') {
          lastCommentText = JSON.parse(msg.data).text
        } else {
          lastCommentText = `${msg.type} file`
        }
        lastCommentAt = msg.createdAt
      }
      return {
        id: msg.id,
        display: msg.createdBy.display,
        createdAt: lastCommentAt,
        lastComment: lastCommentText,
        chatId: msg.chatId
      }
    })

    const dashboardCommentsList = [...commentsList.slice(0, 5)]

    //Get Channels
    const myChannelsResult =
      await teamChatChannelMemberModel.getChannelsWithMember(
        requester.id,
        organization,
      )
    if (myChannelsResult.length === 0) {
      return res.status(200).send(myChannelsResult)
    }
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
            lastMessageText = `${lastMessageObj.type === TEAMCHAT_MESSAGE_TYPE.FILE
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
          id: lastMessageObj?.id,
          channelId: myChannel.channelId,
          name: myChannel.channel.name,
          description: myChannel.channel.description,
          createdAt: lastMessageObj
            ? lastMessageObj.createdAt
            : myChannel.channel.createdAt,
          lastMessage: lastMessageText,
          unread,
        }
      }),
    )
    convertChannels.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    const dashboardChannels = [...convertChannels.slice(0, 5)]

    // Get KanbanBoards
    const rawBoards = await ScrumboardBoardModel.getBoards(organization)
    const rawCards = await Promise.all(
      rawBoards.map(async (board) => {
        const lastCard = await ScrumboardCardModel.getLastCard(board.id)
        return {
          ...lastCard,
        }
      }),
    )
    const kanbanBoards = rawCards.map((card) => {
      return {
        id: card.id,
        boardId: card.boardId,
        listId: card.listId,
        cardTitle: card.title,
        updatedAt: card.updatedAt,
        boardTitle: card.board?.title,
      }
    })
    const dashboardKanbanBooards = [...kanbanBoards.slice(0, 5)]

    // Get Tasks
    const recentTasks = await taskModel.getRecentTasks(organization)
    const dashboardTasks = [...recentTasks.slice(0, 5)]

    // Get Users
    const dashboardUsers = userList.map((user) => {
      return {
        id: user.userId,
        email: user.user.email,
        firstname: user.user.firstname,
        lastname: user.user.lastname,
        display: user.user.display,
        picture: user.user.picture,
        pictureURL:
          user.user.picture &&
            JSON.parse(user.user.picture) &&
            JSON.parse(user.user.picture).filename
            ? gcsService.getUserProfileURL(
              user.userId,
              JSON.parse(user.user.picture).filename,
            )
            : undefined,
      }
    })

    return res.status(200).json({
      allChat,
      openChat,
      todayMessage,
      inboxSummary,
      TotalCustomer,
      dashboardHqUserList,
      dashboardCommentsList,
      dashboardChannels,
      dashboardKanbanBooards,
      dashboardTasks,
      dashboardUsers,
      resovedChats,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannels', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getSummaryforSocket = async (
  params: any
) => {
  try {
    const { reqid, orgId } = params
    const requester = await userModel.getUserWithId(reqid)
    const organization = await organizationModel.getOrganizationWithId(orgId)
    if ((organization != undefined) &&(requester!= undefined)) {
      const userList = await organizationUserModel.getUsers(organization.id)
      // Get All Chat
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date()
      yesterday.setHours(0, 0, 0, 0)
      yesterday.setDate(yesterday.getDate() - 1)

      const thisWeek = new Date()
      thisWeek.setHours(0, 0, 0, 0)
      if (thisWeek.getDay() !== 0) {
        thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 1)
      }
      thisWeek.setDate(thisWeek.getDate() - 6)
      const lastWeek = new Date()
      lastWeek.setHours(0, 0, 0, 0)
      if (lastWeek.getDay() !== 0) {
        lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 6)
      }
      lastWeek.setDate(lastWeek.getDate() - 13)

      const yesterdayAllChat = await getRepository(ChatEntity).count({
        where: {
          organization,
          createdAt: Between(yesterday, today),
        },
      })
      const todayAllChat = await getRepository(ChatEntity).count({
        where: {
          organization,
          createdAt: MoreThan(today),
        },
      })
      
      const allChat = {
        currentRange: 'DT',
        data: {
          count: {
            DT: todayAllChat,
            DY: yesterdayAllChat,
          },
        },
        ranges: {
          DT: 'Today',
          DY: 'Yesterday',
        },
      }
      
      // Get Open Chat
      const openChat = await getRepository(ChatEntity).count({
        where: {
          organization,
          status: CHAT_STATUS.OPEN,
        },
      })

      // Get Resoved Chats
      const resovedChats = await getRepository(ChatEntity).count({
        where: {
          organization,
          status: CHAT_STATUS.RESOLVED,
        },
      })

      const todayMessage = await getRepository(MessageEntity).count({
        where: {
          organization,
          createdAt: MoreThan(today),
        },
      })
      const WTResolvedChats = await getRepository(ChatEntity).find({
        where: {
          status: CHAT_STATUS.RESOLVED,
          isDelete: false,
          organization,
          createdAt: MoreThan(thisWeek),
        },
      })
      const WTresolvedDates = WTResolvedChats.map((rChat) => {
        return rChat.createdAt.setHours(0, 0, 0, 0)
      })
      const WTlineChartObj = WTresolvedDates.reduce(function (prev: any, cur) {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})
      const WTlineChart = Object.keys(WTlineChartObj).map(function (key) {
        return [Number(key), WTlineChartObj[key]]
      })
      const WLResolvedChats = await getRepository(ChatEntity).find({
        where: {
          status: CHAT_STATUS.RESOLVED,
          isDelete: false,
          organization,
          createdAt: Between(lastWeek, thisWeek),
        },
      })
      const WLresolvedDates = WLResolvedChats.map((rChat) => {
        return rChat.createdAt.setHours(0, 0, 0, 0)
      })
      const WLlineChartObj = WLresolvedDates.reduce(function (prev: any, cur) {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})
      const WLlineChart = Object.keys(WLlineChartObj).map(function (key) {
        return [Number(key), WLlineChartObj[key]]
      })
      //Get Inbox Summary/activedChats
      const WTActivedChats = await getRepository(ChatEntity).find({
        where: {
          status: Not(CHAT_STATUS.RESOLVED),
          isDelete: false,
          organization,
          createdAt: MoreThan(thisWeek),
        },
      })
      const WTactivedDates = WTActivedChats.map((aChat) => {
        return aChat.createdAt.setHours(0, 0, 0, 0)
      })
      const WTcolumnChartObj = WTactivedDates.reduce(function (prev: any, cur) {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})
      const WTcolumnChart = Object.keys(WTcolumnChartObj).map(function (key) {
        return [Number(key), WTcolumnChartObj[key]]
      })

      const WLActivedChats = await getRepository(ChatEntity).find({
        where: {
          status: Not(CHAT_STATUS.RESOLVED),
          isDelete: false,
          organization,
          createdAt: Between(lastWeek, thisWeek),
        },
      })
      const WLactivedDates = WLActivedChats.map((aChat) => {
        return aChat.createdAt.setHours(0, 0, 0, 0)
      })
      const WLcolumnChartObj = WLactivedDates.reduce(function (prev: any, cur) {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})
      const WLcolumnChart = Object.keys(WLcolumnChartObj).map(function (key) {
        return [Number(key), WLcolumnChartObj[key]]
      })
      // Get InboxSummary/overview-All Message
      const thisWeekAllMessage = await getRepository(MessageEntity).count({
        where: {
          organization,
          createdAt: MoreThan(thisWeek),
        },
      })
      const lastWeekAllMessage = await getRepository(MessageEntity).count({
        where: {
          organization,
          createdAt: Between(lastWeek, thisWeek),
        },
      })
      const inboxSummary = {
        overview: {
          wt: thisWeekAllMessage,
          wl: lastWeekAllMessage,
        },
        ranges: {
          wt: 'This Week',
          wl: 'Last Week',
        },
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: {
          wt: [
            {
              name: 'Resolved Chat',
              type: 'line',
              data: WTlineChart,
            },
            {
              name: 'Actived Chat',
              type: 'column',
              data: WTcolumnChart,
            },
          ],
          wl: [
            {
              name: 'Resolved Chat',
              type: 'line',
              data: WLlineChart,
            },
            {
              name: 'Actived Chat',
              type: 'column',
              data: WLcolumnChart,
            },
          ],
        },
      }
      // Get Total customer
      const TotalCustomer = await getRepository(CustomerEntity).count({
        where: {
          isDelete: false,
          organization,
        },
      })
      //Get Chat HQ
      const HqMessageUsers = await Promise.all(
        userList.map(async (user) => {
          let lastMessageText = ''
          let lastMessageAt = null

          const hqLastMessages =
            await teamChatHQMessageModel.getLastHQMessagesWithOrganizationId_UserId(
              organization.id,
              user.userId,
            )
          if (hqLastMessages) {
            if (hqLastMessages.type === 'text') {
              lastMessageText = JSON.parse(hqLastMessages.data).text
            } else {
              lastMessageText = `${hqLastMessages.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE
                  ? 'document'
                  : hqLastMessages.type
                } file`
            }
            lastMessageAt = hqLastMessages.createdAt
          }

          return {
            id: hqLastMessages
              ? hqLastMessages.id
              : user.user.id,
            userId: user.userId,
            email: user.user.email,
            display: user.user.display,
            picture: user.user.picture,
            isOnline: user.user.isOnline,
            pictureURL:
              user.user.picture &&
                JSON.parse(user.user.picture) &&
                JSON.parse(user.user.picture).filename
                ? gcsService.getUserProfileURL(
                  user.userId,
                  JSON.parse(user.user.picture).filename,
                )
                : undefined,
            createdAt: hqLastMessages
              ? hqLastMessages.createdAt
              : user.user.createdAt,
            lastMessage: lastMessageText,
          }
        }),
      )
      HqMessageUsers.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      const dashboardHqUserList = [...HqMessageUsers.slice(0, 5)]

      //Get Comments
      let commentsMessageList = await getRepository(ChatCommentEntity).find({
        where: {
          organization,
        },
        relations: ['createdBy'],
        order: { createdAt: 'DESC' },
      })

      // Filter duplicate comments
      commentsMessageList = commentsMessageList.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.chatId === value.chatId),
      )
      const commentsList = commentsMessageList.map((msg) => {
        let lastCommentText = ''
        let lastCommentAt = null
        if (msg) {
          if (msg.type === 'text') {
            lastCommentText = JSON.parse(msg.data).text
          } else {
            lastCommentText = `${msg.type} file`
          }
          lastCommentAt = msg.createdAt
        }
        return {
          id: msg.id,
          display: msg.createdBy.display,
          createdAt: lastCommentAt,
          lastComment: lastCommentText,
          chatId: msg.chatId
        }
      })

      const dashboardCommentsList = [...commentsList.slice(0, 5)]

      //Get Channels
      const myChannelsResult =
        await teamChatChannelMemberModel.getChannelsWithMember(
          requester.id,
          organization,
        )
      if (myChannelsResult.length === 0) {
        return myChannelsResult
      }
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
              lastMessageText = `${lastMessageObj.type === TEAMCHAT_MESSAGE_TYPE.FILE
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
            id: lastMessageObj?.id,
            channelId: myChannel.channelId,
            name: myChannel.channel.name,
            description: myChannel.channel.description,
            createdAt: lastMessageObj
              ? lastMessageObj.createdAt
              : myChannel.channel.createdAt,
            lastMessage: lastMessageText,
            unread,
          }
        }),
      )
      convertChannels.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      const dashboardChannels = [...convertChannels.slice(0, 5)]

      // Get KanbanBoards
      const rawBoards = await ScrumboardBoardModel.getBoards(organization)
      const rawCards = await Promise.all(
        rawBoards.map(async (board) => {
          const lastCard = await ScrumboardCardModel.getLastCard(board.id)
          return {
            ...lastCard,
          }
        }),
      )
      const kanbanBoards = rawCards.map((card) => {
        return {
          id: card.id,
          boardId: card.boardId,
          listId: card.listId,
          cardTitle: card.title,
          updatedAt: card.updatedAt,
          boardTitle: card.board?.title,
        }
      })
      const dashboardKanbanBooards = [...kanbanBoards.slice(0, 5)]

      // Get Tasks
      const recentTasks = await taskModel.getRecentTasks(organization)
      const dashboardTasks = [...recentTasks.slice(0, 5)]

      // Get Users
      const dashboardUsers = userList.map((user) => {
        return {
          id: user.userId,
          email: user.user.email,
          firstname: user.user.firstname,
          lastname: user.user.lastname,
          display: user.user.display,
          picture: user.user.picture,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : undefined,
        }
      })

      return {
        allChat,
        openChat,
        todayMessage,
        inboxSummary,
        TotalCustomer,
        dashboardHqUserList,
        dashboardCommentsList,
        dashboardChannels,
        dashboardKanbanBooards,
        dashboardTasks,
        dashboardUsers,
        resovedChats,
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannels', error)
    return "error500"
  }
}