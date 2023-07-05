import { NextFunction, Request, Response } from 'express'
import { gcsService } from '../../service/google'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationUserModel,
  UserEntity,
  organizationModel,
  userModel,
} from '../../model/organization'
import { ChatEntity, chatModel, CHAT_STATUS } from '../../model/chat'
import { CustomerEntity, customerModel } from '../../model/customer'

import {
  ScrumboardCardActivityEntity,
  ScrumboardCardActivityModel,
  ScrumboardCardAttachmentModel,
  ScrumboardCardChecklistEntity,
  ScrumboardCardEntity,
  ScrumboardCardLabelEntity,
  ScrumboardCardLabelModel,
  ScrumboardCardMemberEntity,
  ScrumboardCardMemberModel,
  ScrumboardCardModel,
  ScrumboardChecklistItemModel,
  ScrumboardChecklistModel,
  ScrumboardListChatModel,
  ScrumboardListModel,
} from '../../model/scrumboard'

import { notificationUtil } from '../../util'

export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { boardId } = req.params
  if (!boardId) {
    errorMessage('CONTROLLER', 'create cards', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const rawCards = await ScrumboardCardModel.getCards(boardId)

  const cards = await Promise.all(
    rawCards.map((card, index) => {
      return convertCardToResultObject(card, requester, organization)
    }),
  )

  const listChats = await ScrumboardListChatModel.getListChats(boardId)
  const cardsFromListChat = await Promise.all(
    listChats.map(async (listChat) => {
      const card = await ScrumboardCardModel.getCardWithChatId(listChat.chatId)
      if (!card) return null
      const cardConverted = await convertCardToResultObject(
        card,
        requester,
        organization,
      )
      return {
        ...cardConverted,
        listId: listChat.listId,
        id: listChat.id,
        cardId: cardConverted.id,
      }
    }),
  )

  // if (listChats.length > 0) console.log('[listChat] ', listChats[0])
  return res
    .status(201)
    .send([
      ...cardsFromListChat.filter((card) => card !== null),
      ...cards.map((card) => ({ ...card, cardId: card.id })),
    ])
}
export const getCardsforSocket = async (
  params: any
) => {
  const { boardId, reqid, orgId } = params
  const requester = await userModel.getUserWithId(reqid)
  const organization = await organizationModel.getOrganizationWithId(orgId)
  if ((organization != undefined) && (requester != undefined)) {
    if (!boardId) {
      errorMessage('CONTROLLER', 'create cards', 'invalid data')
      return "error400"
    }
    const rawCards = await ScrumboardCardModel.getCards(boardId)

    const cards = await Promise.all(
      rawCards.map((card, index) => {
        return convertCardToResultObject(card, requester, organization)
      }),
    )

    const listChats = await ScrumboardListChatModel.getListChats(boardId)
    const cardsFromListChat = await Promise.all(
      listChats.map(async (listChat) => {
        const card = await ScrumboardCardModel.getCardWithChatId(listChat.chatId)
        if (!card) return null
        const cardConverted = await convertCardToResultObject(
          card,
          requester,
          organization,
        )
        return {
          ...cardConverted,
          listId: listChat.listId,
          id: listChat.id,
          cardId: cardConverted.id,
        }
      }),
    )

    // if (listChats.length > 0) console.log('[listChat] ', listChats[0])
    return [
      ...cardsFromListChat.filter((card) => card !== null),
      ...cards.map((card) => ({ ...card, cardId: card.id })),
    ]
  }

}

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { boardId, listId } = req.params

  const { title, description } = req.body.data

  if (!boardId || !listId || !title) {
    errorMessage('CONTROLLER', 'create card', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const maxOrderIndex = await ScrumboardCardModel.getMaxOrderIndex(listId)
    const countListChat =
      await ScrumboardListChatModel.getCountListChatWithListId(listId)
    const saveCard = await ScrumboardCardModel.saveCard({
      ...new ScrumboardCardEntity(),
      title,
      description: description || '',
      orderIndex: maxOrderIndex + countListChat,
      boardId,
      listId,
      createdBy: requester,
      organization,
    })

    const rawCard = await ScrumboardCardModel.getCardWithId(saveCard.id)
    if (!rawCard) {
      errorMessage('CONTROLLER', 'create card', 'getCardWithId')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res
      .status(201)
      .send(await convertCardToResultObject(rawCard, requester, organization))
  } catch (error) {
    errorMessage('CONTROLLER', 'create card', 'createCard', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const { boardId, cardId } = req.params
    const card = req.body.data

    if (!boardId || !cardId || !card) {
      errorMessage('CONTROLLER', 'update board data', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    // console.log('[CARD] ', card)
    const currentCard = await ScrumboardCardModel.getCardWithId(cardId)

    // Save Card
    const newCard = await ScrumboardCardModel.saveCard({
      ...new ScrumboardCardEntity(),
      id: cardId,
      title: card.title,
      description: card.description,
      subscribed: card.subscribed,
      dueDate: card.dueDate,
      attachmentCoverId: card.attachmentCoverId || null,
      boardId,
      updatedBy: requester,
      organization,
    })

    // Delete current Labels Relation
    await ScrumboardCardLabelModel.deleteCardLabels(cardId)
    // Save Labels
    if (card.labels && card.labels.length) {
      // Save new Labels Relation
      await ScrumboardCardLabelModel.saveCardLabels(
        card.labels.map((label: string) => ({
          ...new ScrumboardCardLabelEntity(),
          boardId,
          cardId,
          labelId: label,
        })),
      )
    }

    const currentCardMembers = await ScrumboardCardMemberModel.getCardMembers(
      cardId,
    )

    // Delete Current Member Relation
    await ScrumboardCardMemberModel.deleteCardMembers(cardId)
    // Save new Members Relation
    if (card.memberIds && card.memberIds.length) {
      await ScrumboardCardMemberModel.saveCardMembers(
        card.memberIds.map((memberId: string) => ({
          ...new ScrumboardCardMemberEntity(),
          cardId,
          memberId,
        })),
      )
      if (
        currentCardMembers &&
        currentCardMembers &&
        currentCardMembers.length < card.memberIds.length
      ) {
        // Add new member
        const newMemberIds = card.memberIds.filter(
          (element: string) =>
            !currentCardMembers.some((current) => element === current.memberId),
        )
        notificationUtil.scrumboard.notificationScrumboardNewCardMember(
          newMemberIds,
          card,
          organization,
          requester.id,
        )
      }
    }

    // Save Checklist and Checklist Item
    if (card.checklists && card.checklists.length) {
      const currentChecklists = await ScrumboardChecklistModel.getChecklists(
        cardId,
      )
      // Delete Checklist
      const currentIds = currentChecklists.map((cl) => cl.id)
      const inputIds: any[] = card.checklists.map((cl: any) => cl.id)
      const deleteIds = currentIds.filter(
        (currentId) => !inputIds.includes(currentId),
      )
      for (const id of deleteIds) {
        await ScrumboardChecklistModel.deleteChecklist(id)
      }

      for (const checklist of card.checklists) {
        const saveChecklist = await ScrumboardChecklistModel.saveChecklist({
          ...new ScrumboardCardChecklistEntity(),
          id: checklist.id,
          name: checklist.name,
          cardId,
        })

        const currentChecklistItems =
          await ScrumboardChecklistItemModel.getChecklistItems(saveChecklist.id)
        // Delete Checklist
        const currentItemIds = currentChecklistItems.map((cl) => cl.id)
        const inputItemIds: any[] = checklist.checkItems.map((cl: any) => cl.id)
        const deleteItemIds = currentItemIds.filter(
          (currentItemId) => !inputItemIds.includes(currentItemId),
        )
        for (const id of deleteItemIds) {
          await ScrumboardChecklistItemModel.deleteChecklistItem(id)
        }

        for (const checklistItem of checklist.checkItems) {
          await ScrumboardChecklistItemModel.saveChecklistItem({
            ...checklistItem,
            checklistId: saveChecklist.id,
          })
        }
      }
    } else {
      // Delete all Checklist
      const currentChecklist = await ScrumboardChecklistModel.getChecklists(
        cardId,
      )
      for (const checklist of currentChecklist) {
        await ScrumboardChecklistModel.deleteChecklist(checklist.id)
      }
    }

    // Save new Comment(Activity)
    if (card.activities && card.activities.length) {
      const currentActivities = await ScrumboardCardActivityModel.getActivities(
        cardId,
      )
      const newActivities = await Promise.all(
        card.activities
          .filter(
            ({ id: id1 }: any) =>
              !currentActivities.some(({ id: id2 }) => id2 === id1),
          )
          .map(
            async (activity: {
              id: any
              message: any
              type: any
              time: any
              idMember: any
            }) => {
              const cardActivity = {
                id: activity.id,
                message: activity.message,
                type: activity.type,
                time: activity.time,
                memberId: activity.idMember,
                cardId,
              } as ScrumboardCardActivityEntity

              // get mention user in message
              if (activity.message && activity.type === 'comment') {
                const textMessage = String(activity.message) || ''
                // Find @all for mention all member on card
                if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
                  // All mention
                  notificationUtil.scrumboard.notificationScrumboardNewCardCommentMention(
                    card.memberIds,
                    cardActivity,
                    organization,
                  )
                } else {
                  const mentionEmailList = textMessage.match(
                    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
                  )
                  // Send Notification Event
                  if (
                    mentionEmailList &&
                    mentionEmailList.length &&
                    mentionEmailList.length > 0
                  ) {
                    const _users = await userModel.getUserWithEmailList(
                      mentionEmailList,
                    )
                    notificationUtil.scrumboard.notificationScrumboardNewCardCommentMention(
                      _users.map((_) => _.id),
                      cardActivity,
                      organization,
                    )
                  }
                }
              }
              return cardActivity
            },
          ),
      )
      await ScrumboardCardActivityModel.saveActivities(newActivities)
    }

    // Attachment
    if (card.attachments && card.attachments.length) {
      const currentAttachments =
        await ScrumboardCardAttachmentModel.getAttachments(cardId)
      // Delete Checklist
      const currentIds = currentAttachments.map((cl) => cl.id)
      const inputIds: any[] = card.attachments.map((cl: any) => cl.id)
      const deleteIds = currentIds.filter(
        (currentId) => !inputIds.includes(currentId),
      )
      for (const id of deleteIds) {
        await ScrumboardCardAttachmentModel.deleteAttachment(id)
      }
    } else {
      // Delete all Attachment
      const currentAttachments =
        await ScrumboardCardAttachmentModel.getAttachments(cardId)
      for (const attachment of currentAttachments) {
        await ScrumboardCardAttachmentModel.deleteAttachment(attachment.id)
      }
    }

    const rawCard = await ScrumboardCardModel.getCardWithId(cardId)
    if (!rawCard) {
      errorMessage('CONTROLLER', 'update card', 'getCardWithId')
      return next(new HttpException(500, ErrorCode[500]))
    }

    // Notification
    const cardMembers = await ScrumboardCardMemberModel.getCardMembers(cardId)
    if (cardMembers) {
      if (currentCard) {
        if (
          currentCard.dueDate &&
          newCard.dueDate &&
          currentCard.dueDate !== newCard.dueDate
        ) {
          notificationUtil.scrumboard.notificationScrumboardCardEditDueDate(
            cardMembers.map((_) => _.memberId),
            card,
            organization,
            requester.id,
          )
        } else if (!currentCard.dueDate && newCard.dueDate) {
          notificationUtil.scrumboard.notificationScrumboardCardNewDueDate(
            cardMembers.map((_) => _.memberId),
            card,
            organization,
            requester.id,
          )
        }
      }
    }

    if (card.listChatId) {
      const cardConverted = await convertCardToResultObject(
        rawCard,
        requester,
        organization,
      )
      // const listChat = await ScrumboardListChatModel.getListChatWithListIdChatId(boardId,rawCard.chatId)
      // if (!listChat) {
      //   errorMessage('CONTROLLER', 'update card', 'getListChat')
      //   return next(new HttpException(500, ErrorCode[500]))
      // }
      return res.status(201).send({
        ...cardConverted,
        id: card.listChatId,
      })
    }

    return res
      .status(201)
      .send(await convertCardToResultObject(rawCard, requester, organization))
  } catch (error) {
    errorMessage('CONTROLLER', 'update card data', 'update card data', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateCardsOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const { boardId } = req.params
    const lists = req.body.data

    if (!boardId || !lists || !lists.length) {
      errorMessage('CONTROLLER', 'update board list card order', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const changeData = req.body.changeData
    if (
      changeData &&
      changeData.cardId &&
      changeData.listSourceId !== changeData.listDestinationId
    ) {
      await updateCardData(changeData, organization, requester)
    }

    const listResult = await Promise.all(
      lists.map(async (list: { cards: string[]; id: string }) => {
        const newCardIds = await Promise.all(
          list.cards.map(async (cardId: string, index: number) => {
            const card = await ScrumboardCardModel.getCardWithId(cardId)
            if (card) {
              ScrumboardCardModel.updateOrderIndex(
                card.id,
                list.id,
                index,
                requester,
              )
            } else {
              ScrumboardListChatModel.updateOrderIndex(cardId, list.id, index)
            }
            return cardId
          }),
        )
        return { id: list.id, cards: newCardIds }
      }),
    )
    return res.status(201).send(listResult)
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'update board card order',
      'update board data',
      error,
    )
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    const { boardId, cardId } = req.params

    if (!boardId || !cardId) {
      errorMessage('CONTROLLER', 'delete card', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    await ScrumboardCardModel.deleteCard(cardId, requester)

    const rawCards = await ScrumboardCardModel.getCards(boardId)

    // Update Order Index
    rawCards.forEach((card: ScrumboardCardEntity) => {
      ScrumboardCardModel.updateOrderIndex(
        card.id,
        card.listId,
        card.orderIndex,
        requester,
      )
    })

    return res.status(200).send(cardId)
  } catch (error) {
    errorMessage('CONTROLLER', 'delete card', 'mark delete', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

/**
 * Utils
 */
const convertCardToResultObject = async (
  card: ScrumboardCardEntity,
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  const labels = card.cardLabels
    ? card.cardLabels.map((cardLabel) => cardLabel.labelId)
    : []
  const memberIds = card.cardMembers
    ? card.cardMembers.map((cardMember) => cardMember.memberId)
    : []

  const attachments = card.attachments
    ? card.attachments
      .filter((checklist) => !checklist.isDelete)
      .map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        src: attachment.src,
        time: attachment.time,
        type: attachment.type,
      }))
    : []

  const checklists = card.checklists
    .filter((checklist) => !checklist.isDelete)
    .sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .map((checklist) => {
      const item = checklist.checkItems
        .filter((checkItem) => !checkItem.isDelete)
        .sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
        .map((checkItem) => ({
          name: checkItem.name,
          id: checkItem.id,
          checked: checkItem.checked,
        }))

      return {
        name: checklist.name,
        id: checklist.id,
        checkItems: item,
      }
    })

  const activities = card.activities
    ? card.activities
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .map((activity) => ({
        idMember: activity.memberId,
        message: activity.message,
        id: activity.id,
        type: activity.type,
        time: activity.time,
      }))
    : []

  const chat = await getChat(card.chatId, requester, organization)
  return {
    id: card.id,
    cardId: card.id,
    title: card.title,
    boardId: card.boardId,
    listId: card.listId,
    description: card.description,
    attachmentCoverId: card.attachmentCoverId || '',
    subscribed: card.subscribed,
    memberIds,
    labels,
    attachments,
    checklists,
    activities,
    dueDate: card.dueDate,
    chatId: chat ? chat.id : '',
    // chat,
  }
}

// Get Chat Information for show on Card
const getChat = async (
  chatId: string,
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  const chat = await ScrumboardCardModel.getChat(chatId, organization)
  if (!chat) return null

  chat.message.sort((a, b) => {
    return a.createdAt.getTime() - b.createdAt.getTime()
  })

  const lastMessage =
    chat.message && chat.message.length > 0
      ? chat.message[chat.message.length - 1]
      : null
  const unread = chat.message.filter((msg) => !msg.isRead).length

  const newMention =
    chat.mention.filter(
      (mention) => !mention.isRead && mention.user.id === requester.id,
    ).length > 0

  const pictureURL =
    chat.customer && chat.customer.picture
      ? gcsService.getCustomerDisplayURL(
        organization.id,
        chat.channel.id,
        chat.customer.uid,
        chat.customer.picture,
      )
      : null

  return {
    // ...card.chat,
    id: chat.id,
    status: chat.status,
    description: chat.description,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    channel: chat.channel,
    customer: {
      // ...card.chat.customer,
      id: chat.customer.id,
      firstname: chat.customer.firstname,
      lastname: chat.customer.lastname,
      display: chat.customer.display,
      pictureURL,
      customerLabel: chat.customer.customerLabel,
    },
    newMention,
    lastMessage: lastMessage
      ? {
        id: lastMessage.id,
        data: lastMessage.data,
        type: lastMessage.type,
        createdAt: lastMessage.createdAt,
        updatedAt: lastMessage.updatedAt,
      }
      : {},
    unread: unread > 0 ? unread : null,
  }
}

const updateCardData = async (
  changeData: {
    cardId: string
    listSourceId: string
    listDestinationId: string
  },
  organization: OrganizationEntity,
  requester: UserEntity,
) => {
  const listChat = await ScrumboardListChatModel.getListChatWithId(
    changeData.cardId,
  )
  if (listChat) {
    const source = await ScrumboardListModel.getListWithId(
      changeData.listSourceId,
    )
    const destination = await ScrumboardListModel.getListWithId(
      changeData.listDestinationId,
    )
    const chat = await chatModel.getChatWithId(listChat.chatId, organization)
    if (chat && source && destination) {
      let customerLabel = chat.customer.customerLabel
      customerLabel = customerLabel.filter(
        (label) =>
          !source.listCustomerLabel.some((b) => label.id === b.labelId),
      )
      customerLabel = [
        ...customerLabel,
        ...destination.listCustomerLabel.map((el) => el.label),
      ]

      // Filter duplicate label
      customerLabel = customerLabel.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id),
      )

      // Update Chat Status
      await chatModel.saveChat({
        ...chat,
        status:
          destination.chatType === 'active'
            ? CHAT_STATUS.OPEN
            : CHAT_STATUS.RESOLVED,
      })
      // const lastChat = await chatModel.getLastChatWithCustomerId(
      //   chat.customer.id,
      //   organization,
      // )
      // if (lastChat) {
      //   await chatModel.saveChat({
      //     ...lastChat,
      //     status:
      //       destination.chatType === 'active'
      //         ? CHAT_STATUS.OPEN
      //         : CHAT_STATUS.RESOLVED,
      //   })
      // }

      const newCustomer: CustomerEntity = {
        ...chat.customer,
        customerLabel,
        organization,
        updatedBy: requester,
      }
      await customerModel.saveCustomer(newCustomer)
    }
  }
}
