import path from 'path'
import { config } from 'dotenv'
config({ path: path.join(__dirname, './env/.env') })
import express, { Application, Request, Response } from 'express'
import * as bodyParser from 'body-parser'
import api from './api'
import cors from 'cors'
import admin from 'firebase-admin'
import { Server } from "socket.io";
import { getMessagesinChatforSocket, sendMessageinChatforSocket } from './controller/chat/message'
import { getChatinChatforSocket } from './controller/chat/chat'
import { getTaskforSocket,updateTaskforSocket,getTasksforSocket,createTaskforSocket } from './controller/tasks/tasks'
import { getSummaryforSocket } from './controller/dashboard/dashboard'
import { getMessagesforSocket, getUsersforSocket, getNavigationUsersforSocket } from './controller/teamChat/directMessage'
import { getTeamsforSocket } from './controller/user/team'
import { getCustomersforSocket } from './controller/customer/customer'
import { getLabelsforSocket } from './controller/customer/label'

import { getBoardsforSocket,createBoardforSocket } from './controller/scrumboard/board'

import { getChatinScrum } from './controller/scrumboard/chat'
import { getCardsforSocket } from './controller/scrumboard/card'
import { getOrganizationStateforSocket, createOrganizationforSocket, updateOrganizationforSocket, acceptOrganizationforSocket } from './controller/organization/organization'
import { getPackagesforSocket } from './controller/organization/package'
import { getActivationsforSocket, createActivationWithInviteforSocket, getActivationsInviteforSocket } from './controller/organization/activation'
import { getOrganizationsforSocket } from './controller/organization/organization'
import { updateNotificationTokenforSocket } from './controller/notification/notificationToken'
import { getNotificationsforSocket } from './controller/notification/notification'
import { getPermissionforSocket } from './controller/authorization/permission'
import { sendDirectMessageforSocket } from './controller/teamChat/directMessage'
import { getChannelsforSocket } from './controller/channel/channel'
import { getUserOptionsforSocket, getLabelOptionsforSocket, getChatsinTabforSocket } from './controller/chat/chat'
import {
  Connection,
  createConnection,
  getConnectionManager,
  QueryFailedError,
} from 'typeorm'

import helmet from 'helmet'
import multer from 'multer'
import { errorMessage } from './middleware/exceptions'
createConnection()
  .then(async (connection: Connection) => {
    const PORT = process.env.PORT || 7000
    const app: Application = express()
    const multerMid = multer({
      storage: multer.memoryStorage(),
      limits: {
        // no larger than 5mb.
        fileSize: 25 * 1024 * 1024,
      },
    })
    // app.use(
    //   cors({
    //     origin: '*',
    //   }),
    // )
    app.use(helmet())
    app.use(multerMid.single('file'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.get('/', (req: Request, res: Response) => {
      res.send('' + new Date())
    })
    const WHITELIST = process.env.WHITELIST
    let allowedOrigins: string | any[] = []
    if (WHITELIST) {
      allowedOrigins = WHITELIST.split(',')
    }
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true)
          if (allowedOrigins.indexOf(origin) === -1) {
            const msg =
              'The CORS policy for this site does not ' +
              'allow access from the specified Origin.'
            return callback(new Error(msg), false)
          }
          return callback(null, true)
        },
      }),
    )
    app.use(
      cors({
        origin: '*',
      }),
    )
    app.use('/api', api.router)
    const server = app.listen(PORT, () => {
      console.log('Fox Socket Service listening on port', PORT)
    })
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
      },
    });
    let users = []
    io.on("connection", (socket) => {    
      /**Socket Setup   */
      console.log("Sockets are in action");
      socket.on("fox private setup", (userData) => {
        users.push(userData)
        socket.emit("connected:", userData);
      });
      socket.on("join chat", (room) => {
        socket.join(room);
      });
      socket.on("getNotifications", (param) => {
        getNotificationsforSocket(param).then(result => {
          if (result !== null) {
            socket.emit("getNotifications response", result);
          }
        })
      });
      socket.on("getPermission", (role) => {
        getPermissionforSocket(role).then(result => {
          if ((result !== "error400") && (result !== "error500")) {
            socket.emit("getPermission response", result);
          }
        })
      });
      socket.on("getOrganizationState", (param) => {
        getOrganizationStateforSocket(param).then(result => {
          if (result !== "error400") {
            socket.emit("getOrganizationState response", result);
          }
        })
      });
      socket.on("getNavigationUsers", (param) => {
        getNavigationUsersforSocket(param).then(result => {
          if (result !== "error500") {
            socket.emit("getNavigationUsers response", result);
          }
        })
      });
      socket.on("updateFCMToken", (params) => {
        updateNotificationTokenforSocket(params).then(result => {
          if (result !== "error500") {
            socket.emit("updateFCMToken response", result);
          }
        })
      }); 
      socket.on("getPackages", () => {
        getPackagesforSocket().then(result => {
          if (result !== "error500") {
            socket.emit("getPackages response", result);
          }
        })
      });
      socket.off("setup", (user) => {
        console.log("USER DISCONNECTED");
        socket.leave(user.uuid);
      });
      /**End Setup   */

      /**KanBan   */
      socket.on("getBoards", (orgId) => {
        getBoardsforSocket(orgId).then(result => {
          if (result !== "") {
            socket.emit("getBoards response", result);
          }
        })
      });
      socket.on("getChatinScrum", (params) => {
        getChatinScrum(params).then(result => {
          if (result !== "error400") {
            socket.emit("getChatinScrum response", result);
          }
        })
      });
      socket.on("getCards", (params) => {
        getCardsforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("getCards response", result);
          }
        })
      });
      socket.on("sendMessageinScrum", (params) => {
        sendMessageinChatforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("sendMessageinScrum response", result);
          }
        })
      });
      socket.on("newBoard", (orgId) => {
        createBoardforSocket(orgId).then(result => {
          if (result !== "error400") {
            socket.emit("newBoard response", result);
          }
        })
      });
      /**End Kanban   */

      /**Teams   */
      socket.on("getTeams", (organizationId) => {
        getTeamsforSocket(organizationId).then(result => {
          if (result !== "error500") {
            socket.emit("getTeams response", result);
          }
        })
      });      
      /**End teams   */
           
      /**Organization */
      socket.on("acceptOrganization", (params) => {
        acceptOrganizationforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("acceptOrganization response", result);
          }
          else { socket.emit("acceptOrganization response", "!"); }
        })
      });
      socket.on("addOrganization", (params) => {
        createOrganizationforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("addOrganization response", result);
          }
        })
      });
      socket.on("updateOrganization", (params) => {
        updateOrganizationforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("updateOrganization response", result);
          }
        })
      });
      socket.on("getActivations", (params) => {
        getActivationsforSocket(params).then(result => {
          if (result !== "error500") {
            socket.emit("getActivations response", result);
          }
        })
      });
      socket.on("addInviteCode", (params) => {
        createActivationWithInviteforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("addInviteCode response", result);
          } else socket.emit("addInviteCode response", "!");
        })
      });
      socket.on("getOrganizations", (params) => {
        getOrganizationsforSocket(params).then(result => {
          if (result !== "error500") {
            socket.emit("getOrganizations response", result);
          }
        })
      });
      /**End Organization */

      /**In Dashboard   */
      socket.on("getSummary", (params) => {
        getSummaryforSocket(params).then(result => {
          if (result != "error500") {
            socket.emit("getSummary response", result);
          }
        })
      });
      /**End */

      /**Inbox   */
      socket.on("getChannels", (organizationId) => {
        getChannelsforSocket(organizationId).then(result => {
          if (result != "error500") {
            socket.emit("getChannels response", result);
          }
        })
      });
      socket.on("getUserOptions", (organizationId) => {
        getUserOptionsforSocket(organizationId).then(result => {
          if (result != "error500") {
            socket.emit("getUserOptions response", result);
          }
        })
      });
      socket.on("getLabelOptions", (organizationId) => {
        getLabelOptionsforSocket(organizationId).then(result => {
          if (result != "error500") {
            socket.emit("getLabelOptions response", result);
          }
        })
      });      
      socket.on("getChatsinTab", (params) => {
        getChatsinTabforSocket(params).then(result => {
          if (result != "error500") {
            socket.emit("getChatsinTab response", result);
          }
        })
      });
      socket.on("getChatinChat", (params) => {
        getChatinChatforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("getChatinChat response", result);
          }
        })
      });
      socket.on("getMessagesinChat", (params) => {
        getMessagesinChatforSocket(params).then(result => {
          if (result != "error400") {
            socket.emit("getMessagesinChat response", result);
          }
        })
      });      
      socket.on("sendMessageinChat", (params) => {
        sendMessageinChatforSocket(params).then(result1 => {
          getChatsinTabforSocket(params).then(result2 => {
            socket.emit("sendMessageinChat response", {send:result1,get:result2});
          })    
        })

      });
      /**End Inbox*/

      /**CRM   */
      socket.on("getCustomers", (param) => {
        getCustomersforSocket(param).then(result => {
          if (result !== "error500") {
            socket.emit("getCustomers response", result);
          }
        })
      })
      socket.on("getChannelsinCRM", (param) => {
        getChannelsforSocket(param).then(result => {
          if (result !== "error500") {
            socket.emit("getChannelsinCRM response", result);
          }
        })
      })
      socket.on("getCustomerLabels", (param) => {
        getLabelsforSocket(param).then(result => {
          if (result !== "error500") {
            socket.emit("getCustomerLabels response", result);
          }
        })
      })
      /**End CRM   */

      /**Team Chat   */
      socket.on("getMessage", (params) => {
        getMessagesforSocket(params).then(result => {
          if (result !== "error500") {
            socket.emit("getMessage response", result);
          }
        })
      });
      socket.on("getUsers", (params) => {
        getUsersforSocket(params).then(result => {
          if (result !== "error500") {
            socket.emit("getUsers response", result);
          }
        })
      });      
      socket.on("new message", (msgdata) => {
        sendDirectMessageforSocket(msgdata);
        socket.on("typing", (room) => {
          socket.in(room).emit("typing");
        });
        socket.on("stop typing", (room) => {
          socket.in(room).emit("stop typing");
        });
      });
      /**End Team Chat   */

      /**Task   */
      socket.on("addTask", (params) => {
        createTaskforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("addTask response", result);
          }
        })
      });
      socket.on("getTasks", (params) => {
        getTasksforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("getTasks response", result);
          }
        })
      });
      socket.on("updateTask", (params) => {
        updateTaskforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("updateTask response", result);
          }
        })
      });
      socket.on("getTask", (params) => {
        getTaskforSocket(params).then(result => {
          if (result !== "error400") {
            socket.emit("getTask response", result);
          }
        })
      });
      /**End Task   */

    });
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.CLIENT_EMAIL,
      }),
      databaseURL: process.env.DATABASE_URL,
    })
  })
  .catch((error: QueryFailedError) => {
    errorMessage('DATABASE', 'app', error.message)
  })
