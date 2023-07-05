"use strict";(self.webpackChunkfoxconnect_app=self.webpackChunkfoxconnect_app||[]).push([[39],{97039:function(e,t,a){a.r(t),a.d(t,{default:function(){return ze}});var s=a(29439),l=a(47313),n=a(22408),r=a(58970),i=a(51938),c=a(63738),d=a(61113),o=a(23132),x=a(9038),m=a(4942),u=a(74165),f=a(15861),h=a(80827),j=a(31881),g=a.n(j),p=a(43850),N=a(42939),v=(0,h.hg)("DashboardApp/limitation/getLimitation",function(){var e=(0,f.Z)((0,u.Z)().mark((function e(t,a){var s,l,n,r,i,c;return(0,u.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return s=a.dispatch,l=a.getState,e.prev=1,e.next=4,N.Z.getAccessToken();case 4:return n=e.sent,r=l().organization.activationId,e.next=8,g().get("/api/limitation/".concat(r),{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(n)}});case 8:return i=e.sent,e.next=11,i.data;case 11:return c=e.sent,e.abrupt("return",c);case 15:throw e.prev=15,e.t0=e.catch(1),console.error("getLimitation ",e.t0),s((0,p.PV)({message:"Get Dashboard limitation data error",variant:"error"})),e.t0;case 20:case"end":return e.stop()}}),e,null,[[1,15]])})));return function(t,a){return e.apply(this,arguments)}}()),y=(0,h.oM)({name:"DashboardApp/limitation",initialState:null,reducers:{},extraReducers:(0,m.Z)({},v.fulfilled,(function(e,t){return t.payload}))}),Z=function(e){return e.DashboardApp.limitation},w=y.reducer,b=(0,h.hg)("DashboardApp/widgets/getSummary",function(){var e=(0,f.Z)((0,u.Z)().mark((function e(t,a){var s,l,n,r,i,c,d;return(0,u.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return s=a.dispatch,l=a.getState,e.prev=1,e.next=4,N.Z.getAccessToken();case 4:return n=e.sent,r=l().organization.organizationId,e.next=8,g().get("/api/".concat(r,"/dashboard"),{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(n)}});case 8:return i=e.sent,e.next=11,i.data;case 11:return c=e.sent,d=[{id:"allChat",title:"Total Chat",data:c.allChat},{id:"openChat",title:"Open Chats",data:{name:"Open",count:c.openChat},detail:""},{id:"messageToday",title:"Message Today",count:c.todayMessage},{id:"allMessage",title:"ALl Message",count:c.allMessage},{id:"contacts",title:"Contacts",data:{name:"Total Customer",count:c.TotalCustomer},detail:""},{id:"chatHq",title:"Chat HQ",data:{HqUserList:c.dashboardHqUserList}},{id:"comments",title:"Comments",data:{comments:c.dashboardCommentsList}},{id:"channels",title:"Channels",data:{channels:c.dashboardChannels}},{id:"kanbanBoards",title:"Kanban Board",data:{kanbans:c.dashboardKanbanBooards}},{id:"tasks",title:"Tasks",data:{tasks:c.dashboardTasks}},{id:"users",data:c.dashboardUsers},{id:"resolvedChats",title:"ResolvedChats",data:{name:"Resolved",count:c.resovedChats}},{id:"inboxSummary",title:"InboxSummary",data:c.inboxSummary}],e.abrupt("return",d);case 16:throw e.prev=16,e.t0=e.catch(1),console.error("GetSummary ",e.t0),s((0,p.PV)({message:"Get Dashboard data error",variant:"error"})),e.t0;case 21:case"end":return e.stop()}}),e,null,[[1,16]])})));return function(t,a){return e.apply(this,arguments)}}()),k=(0,h.HF)({}),S=k.getSelectors((function(e){return e.DashboardApp.widgets})),C=S.selectEntities,E=(S.selectById,(0,h.oM)({name:"DashboardApp/widgets",initialState:k.getInitialState({}),reducers:{},extraReducers:(0,m.Z)({},b.fulfilled,(function(e,t){k.setAll(e,t.payload)}))}).reducer),M=(0,x.UY)({limitation:w,widgets:E}),T=a(82295),F=a(66212),A=a(9506),D=a(46417),I=function(e){var t=e.data,a=t.limit,n=t.count,r=(0,l.useState)(!0),i=(0,s.Z)(r,2),c=i[0],o=i[1],x=["#DD6B20","#F6AD55"];return(0,l.useEffect)((function(){o(!1)}),[]),!c&&a&&n?(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto shadow border  rounded-2xl overflow-hidden p-24",children:[(0,D.jsx)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"Message"})}),(0,D.jsx)("div",{className:"flex flex-col flex-auto mt-24 h-96",children:(0,D.jsxs)("div",{className:"text-center py-12 flex flex-row items-baseline justify-center",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none  tracking-tighter",sx:{color:x[0]},children:Math.round(100*parseFloat(n/a*100))/100}),(0,D.jsx)(d.Z,{className:"text-2xl font-normal pl-4",sx:{color:x[1]},children:"%"})]})}),(0,D.jsx)("div",{className:"mt-32",children:(0,D.jsxs)("div",{className:"-my-12 divide-y",children:[(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[0]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"count"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:n.toLocaleString("en-US")})]},0),(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[1]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"limit"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:a.toLocaleString("en-US")})]},1)]})})]}):null},L=(0,l.memo)(I),U=function(e){var t=e.data,a=t.limit,n=t.count,r=(0,l.useState)(!0),i=(0,s.Z)(r,2),c=i[0],o=i[1],x=["#805AD5","#B794F4"];return(0,l.useEffect)((function(){o(!1)}),[]),!c&&a&&n?(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto shadow border  rounded-2xl overflow-hidden p-24",children:[(0,D.jsx)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"Organization"})}),(0,D.jsx)("div",{className:"flex flex-col flex-auto mt-24 h-96",children:(0,D.jsxs)("div",{className:"text-center py-12 flex flex-row items-baseline justify-center",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none tracking-tighter",sx:{color:x[0]},children:Math.round(100*parseFloat(n/a*100))/100}),(0,D.jsx)(d.Z,{className:"text-2xl font-normal pl-4",sx:{color:x[1]},children:"%"})]})}),(0,D.jsx)("div",{className:"mt-32",children:(0,D.jsxs)("div",{className:"-my-12 divide-y",children:[(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[0]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"count"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:n.toLocaleString("en-US")})]},0),(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[1]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"limit"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:a.toLocaleString("en-US")})]},1)]})})]}):null},O=(0,l.memo)(U),B=function(e){var t=e.data,a=t.limit,n=t.total,r=(0,l.useState)(!0),i=(0,s.Z)(r,2),c=i[0],o=i[1],x=["#805AD5","#B794F4"];return(0,l.useEffect)((function(){o(!1)}),[]),!c&&a&&n?(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto shadow border  rounded-2xl overflow-hidden p-24",children:[(0,D.jsx)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"Storage"})}),(0,D.jsx)("div",{className:"flex flex-col flex-auto mt-24 h-96",children:(0,D.jsxs)("div",{className:"text-center py-12 flex flex-row items-baseline justify-center",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-nonetracking-tighter",sx:{color:x[0]},children:Math.round(100*parseFloat(n/a*100))/100}),(0,D.jsx)(d.Z,{className:"text-2xl font-normal  pl-4",sx:{color:x[1]},children:"%"})]})}),(0,D.jsx)("div",{className:"mt-32",children:(0,D.jsxs)("div",{className:"-my-12 divide-y",children:[(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[0]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"total"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:n.toLocaleString("en-US")})]},0),(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[1]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"limit"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:a.toLocaleString("en-US")})]},1)]})})]}):null},R=(0,l.memo)(B),z=function(e){var t=e.data,a=t.limit,n=t.count,r=(0,l.useState)(!0),i=(0,s.Z)(r,2),c=i[0],o=i[1],x=["#319795","#4FD1C5"];return(0,l.useEffect)((function(){o(!1)}),[]),!c&&a&&n?(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto shadow border  rounded-2xl overflow-hidden p-24",children:[(0,D.jsx)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"User"})}),(0,D.jsx)("div",{className:"flex flex-col flex-auto mt-24 h-96",children:(0,D.jsxs)("div",{className:"text-center py-12 flex flex-row items-baseline justify-center",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none tracking-tighter",sx:{color:x[0]},children:Math.round(100*parseFloat(n/a*100))/100}),(0,D.jsx)(d.Z,{className:"text-2xl font-normal pl-4",sx:{color:x[1]},children:"%"})]})}),(0,D.jsx)("div",{className:"mt-32",children:(0,D.jsxs)("div",{className:"-my-12 divide-y",children:[(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[0]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"count"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:n.toLocaleString("en-US")})]},0),(0,D.jsxs)("div",{className:"grid grid-cols-2 py-12",children:[(0,D.jsxs)("div",{className:"flex items-center",children:[(0,D.jsx)(A.Z,{className:"flex-0 w-8 h-8 rounded-full",sx:{backgroundColor:x[1]}}),(0,D.jsx)(d.Z,{className:"ml-12 truncate",children:"limit"})]}),(0,D.jsx)(d.Z,{className:"font-medium text-right pr-10",children:a.toLocaleString("en-US")})]},1)]})})]}):null},H=(0,l.memo)(z),P=function(){var e=(0,n.I0)(),t=(0,l.useState)(!0),a=(0,s.Z)(t,2),r=a[0],i=a[1],c=(0,n.v9)(Z);return(0,l.useEffect)((function(){e(v()).then((function(){return i(!1)}))}),[e]),r||!c?null:(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden",children:[(0,D.jsxs)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:[(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"Package Summary"}),c.package&&"active"===c.package.status&&(0,D.jsx)(F.Z,{label:"Active",color:"success"}),c.package&&"inactive"===c.package.status&&(0,D.jsx)(F.Z,{label:"Inactive"}),c.package&&"expired"===c.package.status&&(0,D.jsx)(F.Z,{label:"Expired",color:"warning"})]}),(0,D.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-24 w-full mt-32 sm:mt-16",children:[(0,D.jsx)("div",{className:"flex flex-col flex-auto",children:(0,D.jsxs)("div",{className:"flex-auto grid grid-cols-2 gap-16 mt-24",children:[(0,D.jsx)(L,{data:c.message}),(0,D.jsx)(R,{data:c.storage})]})}),(0,D.jsx)("div",{className:"flex flex-col",children:(0,D.jsxs)("div",{className:"flex-auto grid grid-cols-2 gap-16 mt-24",children:[(0,D.jsx)(H,{data:c.user}),(0,D.jsx)(O,{data:c.organization})]})})]})]})},_=(0,l.memo)(P),q=function(e){return(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between",children:[(0,D.jsx)("div",{className:"flex items-center justify-between px-4 pt-8 min-h-48",children:(0,D.jsx)(d.Z,{className:"text-16 px-16 font-medium",color:"textSecondary",children:e.data.title})}),(0,D.jsxs)("div",{className:"text-center py-12",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none text-orange tracking-tighter",children:e.data&&e.data.data&&e.data.data.count||0}),(0,D.jsx)(d.Z,{className:"text-lg font-normal text-orange-800",children:e.data.data.name})]})]})},G=(0,l.memo)(q),K=a(88797),Q=a(51405),V=function(e){console.log(e);var t=(0,l.useState)(0),a=(0,s.Z)(t,2),n=a[0],r=a[1];return(0,l.useEffect)((function(){e.data&&e.data.data&&e.data.data.currentRange?r(e.data.data.currentRange):r(0)}),[e.data]),(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto shadow rounded-xl overflow-hidden",children:[(0,D.jsx)("div",{className:"flex items-center px-4 pt-8 min-h-48",children:(0,D.jsx)(K.Z,{className:"mx-16 font-normal text-16",classes:{select:"py-0 flex items-center"},value:n,onChange:function(e){r(e.target.value)},inputProps:{name:"currentRange"},variant:"filled",size:"small",children:e.data&&e.data.data&&e.data.data.ranges&&Object.entries(e.data.data.ranges).map((function(e){var t=(0,s.Z)(e,2),a=t[0],l=t[1];return(0,D.jsx)(Q.Z,{value:a,children:l},a)}))})}),(0,D.jsxs)("div",{className:"text-center py-12",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold tracking-tighter leading-none text-blue-500",children:e.data&&e.data.data&&e.data.data.data&&e.data.data.data.count&&n&&e.data.data.data.count[n]||0}),(0,D.jsx)(d.Z,{className:"text-lg font-normal text-blue-600 dark:text-blue-500",children:e.data.title})]})]})},W=(0,l.memo)(V),J=a(63445),X=a(19536),Y=a(48310),$=a(89840),ee=a(57597),te=a(83061),ae=a(89600),se=a(64385),le=a(7918),ne=function(e){return console.log(e),(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsx)("div",{className:"flex items-center justify-between py-10",children:(0,D.jsx)(d.Z,{className:"text-16 px-16 font-medium",color:"textSecondary",children:e.data.title})}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:e.data&&e.data.data&&e.data.data.HqUserList&&e.data.data.HqUserList.map((function(e,t){return e.lastMessage?(0,D.jsx)($.Z,{className:(0,te.Z)("max-h-80 w-full !no-underline"),component:le.fO,to:"/apps/teamChat/hq/#".concat(e.id),children:(0,D.jsxs)("div",{className:"flex flex-row items-center w-full min-h-[7rem]",children:[(0,D.jsx)(ee.i6,{contact:e,className:"w-48 h-48"}),(0,D.jsxs)("div",{className:"flex flex-col pl-[1.5rem] w-[calc(100%-4.8rem)]",children:[(0,D.jsx)("div",{className:"flex w-full",children:(0,D.jsx)(d.Z,{className:"truncate w-full text-14 rounded-r-full rounded-l-full bg-[#F6F7F9] p-10",variant:"body2",color:"text.secondary",children:(0,D.jsx)(se.Z,{children:(0,D.jsx)("div",{dangerouslySetInnerHTML:{__html:J.Z.formatMentionToText(e.lastMessage)}})})})}),(0,D.jsxs)("div",{className:"flex justify-start items-center",children:[(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:"font-semibold text-12",children:e.display}),(0,D.jsx)(d.Z,{className:"text text-12 text-gray-500 pl-10",children:(0,ae.Z)(new Date(e.createdAt),"dd/MM/yy")})]})]})]})},t):null}))})]})},re=(0,l.memo)(ne),ie=function(e){return console.log(e),(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsxs)("div",{className:"flex items-center justify-start py-10",children:[(0,D.jsx)(d.Z,{className:"text-16 pl-16 font-medium",color:"textSecondary",children:e.data.title}),(0,D.jsx)(d.Z,{className:"text-12 px-16 pl-10 text-gray-500",children:"(New Team Chats)"})]}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:e.data&&e.data.data&&e.data.data.channels&&e.data.data.channels.map((function(e,t){return e.lastMessage?(0,D.jsx)($.Z,{className:(0,te.Z)("max-h-80 w-full"),component:le.fO,to:"/apps/teamChat/".concat(e.channelId,"/#").concat(e.id),children:(0,D.jsxs)("div",{className:"flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around",children:[(0,D.jsxs)("div",{className:"flex justify-between items-end",children:[(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:"font-medium text-14",children:e.name}),e.createdAt&&(0,D.jsx)(d.Z,{className:"text text-12 text-gray-500",children:(0,ae.Z)(new Date(e.createdAt),"dd/MM/yy")})]}),(0,D.jsxs)("div",{className:"flex w-full justify-between items-center space-x-6",children:[(0,D.jsx)(d.Z,{className:"truncate w-full text-12",variant:"body2",color:"text.secondary",children:(0,D.jsx)(se.Z,{children:(0,D.jsx)("div",{dangerouslySetInnerHTML:{__html:J.Z.formatMentionToText(e.lastMessage)}})})}),Boolean(e.unread)&&(0,D.jsx)(A.Z,{sx:{backgroundColor:"secondary.main",color:"secondary.contrastText"},className:"flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center",children:e.unread})]})]})},t):null}))})]})},ce=(0,l.memo)(ie),de=a(65152),oe=function(e){console.log(e);return(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsxs)("div",{className:"flex items-end justify-start py-10",children:[(0,D.jsx)(d.Z,{className:"text-16 pl-16 font-medium",color:"textSecondary",children:e.data.title}),(0,D.jsx)(d.Z,{className:"text-12 pl-10 text-gray-500",children:"(Recent Comments)"})]}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:e.data&&e.data.data&&e.data.data.comments&&e.data.data.comments.map((function(e,t){return e.lastComment?(0,D.jsx)($.Z,{className:"max-h-80 w-full",onClick:function(t){return function(e,t){e.preventDefault(),de.Z.push("/apps/chat/".concat(t.chatId,"/#").concat(t.id))}(t,e)},children:(0,D.jsxs)("div",{className:"flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around",children:[(0,D.jsxs)("div",{className:"flex justify-between items-center",children:[(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:"font-medium text-14",children:e.display}),(0,D.jsx)(d.Z,{className:"text text-12 text-gray-500",children:(0,ae.Z)(new Date(e.createdAt),"dd/MM/yy")})]}),(0,D.jsx)("div",{className:"flex w-full",children:(0,D.jsx)(d.Z,{className:"truncate w-full text-12",variant:"body2",color:"text.secondary",children:(0,D.jsx)(se.Z,{children:(0,D.jsx)("div",{dangerouslySetInnerHTML:{__html:J.Z.formatMentionToText(e.lastComment)}})})})})]})},t):null}))})]})},xe=(0,l.memo)(oe),me=a(70022),ue=a(1413),fe=a(97890),he=a(60194),je=a(88564),ge=a(15743),pe=a(5227),Ne=a(93229),ve=(0,je.ZP)(he.ZP)((function(e){var t=e.theme;e.active;return{"&.active":{backgroundColor:t.palette.background.default},"&.label":{borderRadius:6}}})),ye=function(e){var t,a=e.chat,r=(0,n.I0)(),i=(0,fe.UO)(),c=(0,l.useState)(""),o=(0,s.Z)(c,2),x=o[0],m=o[1],u=(0,n.v9)((function(e){return(0,Ne.jm)(e,a.channelId)}));return(0,l.useMemo)((function(){if(a&&a.lastMessage){var e=a.lastMessage;if(!e.isDelete&&e.data&&""!==e.data){var t=JSON.parse(e.data);if("text"===e.type){var s=t.text;s.length>30?m("".concat(s.substring(0,30),"...")):m(s.substring(0,30))}else"sticker"===e.type?m("Sticker"):"image"===e.type?m("Image"):"story"===e.type?m("Reacted to your story"):"story_mention"===e.type?m("Mention you in a story"):m("Unknown type")}else m("This message has been deleted...")}}),[a]),a&&u?(0,D.jsx)(ve,{button:!0,className:"flex items-center max-h-80 w-full",active:i.id===a.id?1:0,component:pe.Z,to:"/apps/chat/".concat(a.id),end:!0,activeClassName:"active",onClick:function(){r((0,me.aQ)((0,ue.Z)((0,ue.Z)({},a),{},{unread:0})))},children:(0,D.jsxs)("div",{className:"flex items-center flex-row w-full space-x-12 px-[1.5rem] min-h-[7rem] border-1 border-[#F5F5F5] shadow rounded-sm",children:[(0,D.jsx)(ee.f4,{contact:a.customer,channel:u}),(0,D.jsxs)("div",{className:"flex flex-col grow",children:[(0,D.jsxs)("div",{className:"flex justify-between items-center",children:[(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:(0,te.Z)("truncate font-semibold text-14"),children:null===(t=a.customer)||void 0===t?void 0:t.display}),a.lastMessage&&a.lastMessage.createdAt&&(0,D.jsx)(d.Z,{className:"whitespace-nowra font-medium text-12",color:"text.secondary",children:(0,ae.Z)(new Date(a.lastMessage.createdAt),"dd/MM/yy")})]}),(0,D.jsxs)("div",{className:"flex justify-between pt-10",children:[(0,D.jsx)(d.Z,{variant:"body2",className:"truncate",color:"text.secondary",children:(0,D.jsx)(se.Z,{children:x})}),(0,D.jsx)("div",{className:"items-center flex flex-row space-x-6",children:Boolean(a.unread)&&(0,D.jsx)(ge.Z,{sx:{backgroundColor:"secondary.main",color:"secondary.contrastText"},className:"flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center",children:a.unread})})]})]})]})}):null},Ze=function(e){var t=(0,n.I0)(),a=(0,l.useState)(!0),r=(0,s.Z)(a,2),i=r[0],c=r[1],o=(0,l.useState)([]),x=(0,s.Z)(o,2),m=x[0],u=x[1];return(0,l.useEffect)((function(){t((0,Ne.Ky)()),t((0,me.zG)({})).unwrap().then((function(e){c(!1),u(e.slice(0,5))}))}),[]),!m||i?null:(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsxs)("div",{className:"flex items-end justify-start py-10",children:[(0,D.jsx)(d.Z,{className:"text-16 pl-16 font-medium",color:"textSecondary",children:"Inbox"}),(0,D.jsx)(d.Z,{className:"text-12 font-medium pl-10 text-gray-500",children:"(Recent Chats)"})]}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:m&&m.map((function(e,t){return(0,D.jsx)(ye,{chat:e},t)}))})]})},we=function(e){return console.log(e),(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsxs)("div",{className:"flex items-end justify-start py-10",children:[(0,D.jsx)(d.Z,{className:"text-16 pl-16 font-medium",color:"textSecondary",children:e.data.title}),(0,D.jsx)(d.Z,{className:"text-12 pl-10 text-gray-500",children:"(Recent Updates)"})]}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:e.data&&e.data.data&&e.data.data.kanbans&&e.data.data.kanbans.map((function(e,t){return e?(0,D.jsx)($.Z,{className:"max-h-80 w-full",component:le.fO,to:"/apps/kanbanboard/boards/".concat(e.boardId,"/#").concat(e.id),children:(0,D.jsxs)("div",{className:"flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around",children:[(0,D.jsxs)("div",{className:"flex justify-between items-center",children:[(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:"font-medium text-14",children:e.boardTitle}),e.updatedAt&&(0,D.jsx)(d.Z,{className:"text text-12 text-gray-500",children:(0,ae.Z)(new Date(e.updatedAt),"dd/MM/yy")})]}),(0,D.jsxs)("div",{className:"flex justify-between items-center",children:[(0,D.jsx)(d.Z,{className:"truncate text-12",variant:"body2",color:"text.secondary",children:(0,D.jsx)(se.Z,{children:e.cardTitle})}),(0,D.jsx)(d.Z,{className:"font-medium text-12 text-[#FF1313]",children:"Updated"})]})]})},t):null}))})]})},be=(0,l.memo)(we),ke=a(56993),Se=function(e){return console.log(e),(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between max-w-full",children:[(0,D.jsxs)("div",{className:"flex items-end justify-start py-10",children:[(0,D.jsx)(d.Z,{className:"text-16 pl-16 font-medium",color:"textSecondary",children:e.data.title}),(0,D.jsx)(d.Z,{className:"text-12 pl-10 text-gray-500",children:"(Recent Tasks Lists)"})]}),(0,D.jsx)(X.Z,{className:"border-[#E5E5E5]"}),(0,D.jsx)(Y.Z,{className:"w-full min-h-[42rem]",children:e.data&&e.data.data&&e.data.data.tasks&&e.data.data.tasks.map((function(e,t){return e?(0,D.jsx)($.Z,{className:"max-h-80 w-full",component:le.fO,to:"/apps/tasks/".concat(e.id),children:(0,D.jsx)("div",{className:"flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around",children:(0,D.jsxs)("div",{className:"flex justify-between items-center",children:[(0,D.jsxs)("div",{className:"flex justify-start space-x-16",children:[(0,D.jsx)(ke.Z,{size:24,color:"action",children:"heroicons-outline:check-circle"}),(0,D.jsx)(d.Z,{variant:"subtitle1",color:"text.primary",className:"font-400 text-14 truncate",children:e.title})]}),e.updatedAt&&(0,D.jsx)(d.Z,{className:"text text-12 text-gray-500",children:(0,ae.Z)(new Date(e.updatedAt),"PP")})]})})},t):null}))})]})},Ce=(0,l.memo)(Se),Ee=a(58631),Me=function(e){console.log(e);var t=(0,n.v9)(Ee.dy);return(0,D.jsx)(Y.Z,{className:"pb-16 flex flex-wrap justify-center",children:e.data&&e.data.data&&e.data.data.filter((function(e){return e.id!==t.uuid})).map((function(e,t){return(0,D.jsx)(he.ZP,{className:"max-w-60 p-0 m-10 md:mx-20",children:(0,D.jsx)(ee.i6,{contact:e,className:"w-60 h-60"})},t)}))})},Te=function(e){return console.log(e),(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between",children:[(0,D.jsx)("div",{className:"flex items-center justify-between px-4 pt-8 min-h-48",children:(0,D.jsx)(d.Z,{className:"text-16 px-16 font-medium",color:"textSecondary",children:e.data.title})}),(0,D.jsxs)("div",{className:"text-center py-12",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none text-blue-500 tracking-tighter",children:e.data&&e.data.data&&e.data.data.count||0}),(0,D.jsx)(d.Z,{className:"text-lg font-normal text-blue-600 dark:text-blue-500",children:e.data.data.name})]})]})},Fe=(0,l.memo)(Te),Ae=function(e){return(0,D.jsxs)(T.Z,{className:"w-full rounded-xl shadow flex flex-col justify-between",children:[(0,D.jsx)("div",{className:"flex items-center justify-between px-4 pt-8 min-h-48",children:(0,D.jsx)(d.Z,{className:"text-16 px-16 font-medium",color:"textSecondary",children:e.data.title})}),(0,D.jsxs)("div",{className:"text-center py-12",children:[(0,D.jsx)(d.Z,{className:"text-7xl sm:text-8xl font-semibold leading-none text-green-500 tracking-tighter",children:e.data&&e.data.data&&e.data.data.count||0}),(0,D.jsx)(d.Z,{className:"text-lg font-normal text-green-600",children:e.data.data.name})]})]})},De=(0,l.memo)(Ae),Ie=a(19860),Le=a(65280),Ue=a(5297),Oe=a(58446),Be=function(e){console.log(e);(0,n.I0)();var t=(0,Ie.Z)(),a=(0,l.useState)(!0),r=(0,s.Z)(a,2),i=r[0],c=r[1],o=(0,l.useState)(),x=(0,s.Z)(o,2),m=x[0],u=x[1],f=(0,l.useState)(),h=(0,s.Z)(f,2),j=h[0],g=h[1],p=(0,l.useState)(),N=(0,s.Z)(p,2),v=N[0],y=N[1],Z=(0,l.useState)(),w=(0,s.Z)(Z,2),b=w[0],k=w[1],S=(0,l.useState)(0),C=(0,s.Z)(S,2),E=C[0],M=C[1],F={chart:{fontFamily:"inherit",foreColor:"inherit",height:"100%",type:"line",toolbar:{show:!1},zoom:{enabled:!1}},colors:[t.palette.primary.main,t.palette.secondary.main],dataLabels:{enabled:!0,enabledOnSeries:[0],background:{borderWidth:0}},grid:{borderColor:t.palette.divider},legend:{show:!1},plotOptions:{bar:{columnWidth:"50%"}},states:{hover:{filter:{type:"darken",value:.75}}},stroke:{width:[3,0]},tooltip:{followCursor:!0,theme:t.palette.mode},xaxis:{type:"datetime",min:Date.now()-5184e5,max:Date.now(),axisBorder:{show:!1},axisTicks:{color:t.palette.divider},labels:{format:"ddd",style:{colors:t.palette.text.secondary}},tooltip:{enabled:!1}},yaxis:{labels:{offsetX:-16,style:{colors:t.palette.text.secondary}}}};return(0,l.useEffect)((function(){c(!1)}),[]),(0,l.useEffect)((function(){e.data&&(e.data.overview&&u(e.data.overview),e.data.series&&g(e.data.series),e.data.ranges&&(y(e.data.ranges),k(Object.keys(v)[E])))}),[e.data]),i?null:(0,D.jsxs)(T.Z,{className:"flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden",children:[(0,D.jsxs)("div",{className:"flex flex-col sm:flex-row items-start justify-between",children:[(0,D.jsx)(d.Z,{className:"text-lg font-medium tracking-tight leading-6 truncate",children:"Unified Chat Inbox Summary"}),(0,D.jsx)("div",{className:"mt-12 sm:mt-0 sm:ml-8",children:(0,D.jsx)(Ue.Z,{value:E,onChange:function(e,t){return M(t)},indicatorColor:"secondary",textColor:"inherit",variant:"scrollable",scrollButtons:!1,className:"-mx-4 min-h-40",classes:{indicator:"flex justify-center bg-transparent w-full h-full"},TabIndicatorProps:{children:(0,D.jsx)(A.Z,{sx:{bgcolor:"text.disabled"},className:"w-full h-full rounded-full opacity-20"})},children:v&&Object.entries(v).map((function(e){var t=(0,s.Z)(e,2),a=t[0],l=t[1];return(0,D.jsx)(Le.Z,{className:"text-14 font-semibold min-h-40 min-w-64 mx-4 px-12",disableRipple:!0,label:l},a)}))})})]}),(0,D.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-24 w-full mt-32 sm:mt-16",children:[(0,D.jsxs)("div",{className:"flex flex-col flex-auto",children:[(0,D.jsx)(d.Z,{className:"font-medium",color:"text.secondary",children:"Inbox"}),(0,D.jsx)("div",{className:"flex flex-col flex-auto",children:j&&b&&(0,D.jsx)(Oe.Z,{className:"flex-auto w-full",options:F,series:j[b],height:320})})]}),(0,D.jsxs)("div",{className:"flex flex-col",children:[(0,D.jsx)(d.Z,{className:"font-medium",color:"text.secondary",children:"Overview"}),(0,D.jsxs)("div",{className:"flex-auto grid grid-cols-2 gap-16 mt-24",children:[(0,D.jsxs)("div",{className:"flex flex-col items-center justify-center py-32 px-4 rounded-2xl bg-indigo-50",children:[(0,D.jsx)(d.Z,{className:"text-5xl sm:text-7xl font-semibold leading-none tracking-tight text-indigo",children:m&&b&&m.length&&m[b]||0}),(0,D.jsx)(d.Z,{className:"mt-4 text-sm sm:text-lg font-medium text-indigo-800",children:"Total Message"})]}),(0,D.jsxs)("div",{className:"flex flex-col items-center justify-center py-32 px-4 rounded-2xl bg-green-50",children:[(0,D.jsx)(d.Z,{className:"text-5xl sm:text-7xl font-semibold leading-none tracking-tight text-green",children:e.messageToday&&e.messageToday.count||0}),(0,D.jsx)(d.Z,{className:"mt-4 text-sm sm:text-lg font-medium text-green-800",children:e.messageToday&&e.messageToday.title})]})]})]})]})]})},Re=(0,l.memo)(Be),ze=(0,o.Z)("DashboardApp",M)((function(){var e=(0,n.I0)(),t=(0,n.v9)(C),a=(0,l.useState)(!0),o=(0,s.Z)(a,2),x=o[0],m=o[1];if((0,l.useEffect)((function(){e(b()).then((function(){return m(!1)}))}),[e]),r.Z.isEmpty(t))return null;var u={hidden:{opacity:0,y:20},show:{opacity:1,y:0}};return x?(0,D.jsx)("div",{className:"flex w-full h-full items-center",children:(0,D.jsx)(c.Z,{})}):(0,D.jsxs)("div",{className:"w-full",children:[(0,D.jsxs)("div",{className:"flex flex-col items-center pt-32 justify-center ",children:[(0,D.jsx)(d.Z,{className:"text-32 font-700 text-gray-500 ",children:"FoxConnect"}),(0,D.jsx)(d.Z,{className:"text-18 foct-300 text-gray-500",children:"FoxConnect Team"})]}),(0,D.jsx)(i.E.div,{className:"flex flex-col md:flex-row sm:p-8 container",variants:{show:{transition:{staggerChildren:.06}}},initial:"hidden",animate:"show",children:(0,D.jsxs)("div",{className:"flex flex-col w-full",children:[(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(Me,{data:t.users})}),(0,D.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-24 w-full min-w-0 p-24",children:[(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(re,{data:t.chatHq})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(Ze,{})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(xe,{data:t.comments})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(ce,{data:t.channels})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(be,{data:t.kanbanBoards})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(Ce,{data:t.tasks})})]}),(0,D.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-24 w-full min-w-0 p-24",children:[(0,D.jsx)(i.E.div,{variants:u,className:"sm:col-span-2 md:col-span-4",children:(0,D.jsx)(_,{})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(W,{data:t.allChat})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(Fe,{data:t.contacts})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(G,{data:t.openChat})}),(0,D.jsx)(i.E.div,{variants:u,children:(0,D.jsx)(De,{data:t.resolvedChats})}),(0,D.jsx)(i.E.div,{variants:u,className:"sm:col-span-2 md:col-span-4",children:(0,D.jsx)(Re,{data:t.inboxSummary,messageToday:t.messageToday})})]})]})})]})}))}}]);