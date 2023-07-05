/*! For license information please see 70.3ab6d7b0.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkfoxconnect_app=self.webpackChunkfoxconnect_app||[]).push([[70],{48070:function(e,t,r){r.d(t,{Z:function(){return fr}});var n=r(63366),i=r(87462),s=r(47313),o="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},a="object"===("undefined"===typeof window?"undefined":o(window))&&"object"===("undefined"===typeof document?"undefined":o(document))&&9===document.nodeType,u=r(43144),l=r(94578),c=r(97326),h={}.constructor;function f(e){if(null==e||"object"!==typeof e)return e;if(Array.isArray(e))return e.map(f);if(e.constructor!==h)return e;var t={};for(var r in e)t[r]=f(e[r]);return t}function d(e,t,r){void 0===e&&(e="unnamed");var n=r.jss,i=f(t),s=n.plugins.onCreateRule(e,i,r);return s||(e[0],null)}var p=function(e,t){for(var r="",n=0;n<e.length&&"!important"!==e[n];n++)r&&(r+=t),r+=e[n];return r},y=function(e){if(!Array.isArray(e))return e;var t="";if(Array.isArray(e[0]))for(var r=0;r<e.length&&"!important"!==e[r];r++)t&&(t+=", "),t+=p(e[r]," ");else t=p(e,", ");return"!important"===e[e.length-1]&&(t+=" !important"),t};function v(e){return e&&!1===e.format?{linebreak:"",space:""}:{linebreak:"\n",space:" "}}function g(e,t){for(var r="",n=0;n<t;n++)r+="  ";return r+e}function m(e,t,r){void 0===r&&(r={});var n="";if(!t)return n;var i=r.indent,s=void 0===i?0:i,o=t.fallbacks;!1===r.format&&(s=-1/0);var a=v(r),u=a.linebreak,l=a.space;if(e&&s++,o)if(Array.isArray(o))for(var c=0;c<o.length;c++){var h=o[c];for(var f in h){var d=h[f];null!=d&&(n&&(n+=u),n+=g(f+":"+l+y(d)+";",s))}}else for(var p in o){var m=o[p];null!=m&&(n&&(n+=u),n+=g(p+":"+l+y(m)+";",s))}for(var b in t){var x=t[b];null!=x&&"fallbacks"!==b&&(n&&(n+=u),n+=g(b+":"+l+y(x)+";",s))}return(n||r.allowEmpty)&&e?(n&&(n=""+u+n+u),g(""+e+l+"{"+n,--s)+g("}",s)):n}var b=/([[\].#*$><+~=|^:(),"'`\s])/g,x="undefined"!==typeof CSS&&CSS.escape,k=function(e){return x?x(e):e.replace(b,"\\$1")},S=function(){function e(e,t,r){this.type="style",this.isProcessed=!1;var n=r.sheet,i=r.Renderer;this.key=e,this.options=r,this.style=t,n?this.renderer=n.renderer:i&&(this.renderer=new i)}return e.prototype.prop=function(e,t,r){if(void 0===t)return this.style[e];var n=!!r&&r.force;if(!n&&this.style[e]===t)return this;var i=t;r&&!1===r.process||(i=this.options.jss.plugins.onChangeValue(t,e,this));var s=null==i||!1===i,o=e in this.style;if(s&&!o&&!n)return this;var a=s&&o;if(a?delete this.style[e]:this.style[e]=i,this.renderable&&this.renderer)return a?this.renderer.removeProperty(this.renderable,e):this.renderer.setProperty(this.renderable,e,i),this;var u=this.options.sheet;return u&&u.attached,this},e}(),R=function(e){function t(t,r,n){var i;i=e.call(this,t,r,n)||this;var s=n.selector,o=n.scoped,a=n.sheet,u=n.generateId;return s?i.selectorText=s:!1!==o&&(i.id=u((0,c.Z)((0,c.Z)(i)),a),i.selectorText="."+k(i.id)),i}(0,l.Z)(t,e);var r=t.prototype;return r.applyTo=function(e){var t=this.renderer;if(t){var r=this.toJSON();for(var n in r)t.setProperty(e,n,r[n])}return this},r.toJSON=function(){var e={};for(var t in this.style){var r=this.style[t];"object"!==typeof r?e[t]=r:Array.isArray(r)&&(e[t]=y(r))}return e},r.toString=function(e){var t=this.options.sheet,r=!!t&&t.options.link?(0,i.Z)({},e,{allowEmpty:!0}):e;return m(this.selectorText,this.style,r)},(0,u.Z)(t,[{key:"selector",set:function(e){if(e!==this.selectorText){this.selectorText=e;var t=this.renderer,r=this.renderable;if(r&&t)t.setSelector(r,e)||t.replaceRule(r,this)}},get:function(){return this.selectorText}}]),t}(S),w={onCreateRule:function(e,t,r){return"@"===e[0]||r.parent&&"keyframes"===r.parent.type?null:new R(e,t,r)}},P={indent:1,children:!0},C=/@([\w-]+)/,j=function(){function e(e,t,r){this.type="conditional",this.isProcessed=!1,this.key=e;var n=e.match(C);for(var s in this.at=n?n[1]:"unknown",this.query=r.name||"@"+this.at,this.options=r,this.rules=new Q((0,i.Z)({},r,{parent:this})),t)this.rules.add(s,t[s]);this.rules.process()}var t=e.prototype;return t.getRule=function(e){return this.rules.get(e)},t.indexOf=function(e){return this.rules.indexOf(e)},t.addRule=function(e,t,r){var n=this.rules.add(e,t,r);return n?(this.options.jss.plugins.onProcessRule(n),n):null},t.replaceRule=function(e,t,r){var n=this.rules.replace(e,t,r);return n&&this.options.jss.plugins.onProcessRule(n),n},t.toString=function(e){void 0===e&&(e=P);var t=v(e).linebreak;if(null==e.indent&&(e.indent=P.indent),null==e.children&&(e.children=P.children),!1===e.children)return this.query+" {}";var r=this.rules.toString(e);return r?this.query+" {"+t+r+t+"}":""},e}(),O=/@container|@media|@supports\s+/,Z={onCreateRule:function(e,t,r){return O.test(e)?new j(e,t,r):null}},A={indent:1,children:!0},I=/@keyframes\s+([\w-]+)/,M=function(){function e(e,t,r){this.type="keyframes",this.at="@keyframes",this.isProcessed=!1;var n=e.match(I);n&&n[1]?this.name=n[1]:this.name="noname",this.key=this.type+"-"+this.name,this.options=r;var s=r.scoped,o=r.sheet,a=r.generateId;for(var u in this.id=!1===s?this.name:k(a(this,o)),this.rules=new Q((0,i.Z)({},r,{parent:this})),t)this.rules.add(u,t[u],(0,i.Z)({},r,{parent:this}));this.rules.process()}return e.prototype.toString=function(e){void 0===e&&(e=A);var t=v(e).linebreak;if(null==e.indent&&(e.indent=A.indent),null==e.children&&(e.children=A.children),!1===e.children)return this.at+" "+this.id+" {}";var r=this.rules.toString(e);return r&&(r=""+t+r+t),this.at+" "+this.id+" {"+r+"}"},e}(),N=/@keyframes\s+/,E=/\$([\w-]+)/g,T=function(e,t){return"string"===typeof e?e.replace(E,(function(e,r){return r in t?t[r]:e})):e},q=function(e,t,r){var n=e[t],i=T(n,r);i!==n&&(e[t]=i)},V={onCreateRule:function(e,t,r){return"string"===typeof e&&N.test(e)?new M(e,t,r):null},onProcessStyle:function(e,t,r){return"style"===t.type&&r?("animation-name"in e&&q(e,"animation-name",r.keyframes),"animation"in e&&q(e,"animation",r.keyframes),e):e},onChangeValue:function(e,t,r){var n=r.options.sheet;if(!n)return e;switch(t){case"animation":case"animation-name":return T(e,n.keyframes);default:return e}}},z=function(e){function t(){return e.apply(this,arguments)||this}return(0,l.Z)(t,e),t.prototype.toString=function(e){var t=this.options.sheet,r=!!t&&t.options.link?(0,i.Z)({},e,{allowEmpty:!0}):e;return m(this.key,this.style,r)},t}(S),G={onCreateRule:function(e,t,r){return r.parent&&"keyframes"===r.parent.type?new z(e,t,r):null}},W=function(){function e(e,t,r){this.type="font-face",this.at="@font-face",this.isProcessed=!1,this.key=e,this.style=t,this.options=r}return e.prototype.toString=function(e){var t=v(e).linebreak;if(Array.isArray(this.style)){for(var r="",n=0;n<this.style.length;n++)r+=m(this.at,this.style[n]),this.style[n+1]&&(r+=t);return r}return m(this.at,this.style,e)},e}(),U=/@font-face/,J={onCreateRule:function(e,t,r){return U.test(e)?new W(e,t,r):null}},$=function(){function e(e,t,r){this.type="viewport",this.at="@viewport",this.isProcessed=!1,this.key=e,this.style=t,this.options=r}return e.prototype.toString=function(e){return m(this.key,this.style,e)},e}(),B={onCreateRule:function(e,t,r){return"@viewport"===e||"@-ms-viewport"===e?new $(e,t,r):null}},L=function(){function e(e,t,r){this.type="simple",this.isProcessed=!1,this.key=e,this.value=t,this.options=r}return e.prototype.toString=function(e){if(Array.isArray(this.value)){for(var t="",r=0;r<this.value.length;r++)t+=this.key+" "+this.value[r]+";",this.value[r+1]&&(t+="\n");return t}return this.key+" "+this.value+";"},e}(),_={"@charset":!0,"@import":!0,"@namespace":!0},D={onCreateRule:function(e,t,r){return e in _?new L(e,t,r):null}},F=[w,Z,V,G,J,B,D],H={process:!0},K={force:!0,process:!0},Q=function(){function e(e){this.map={},this.raw={},this.index=[],this.counter=0,this.options=e,this.classes=e.classes,this.keyframes=e.keyframes}var t=e.prototype;return t.add=function(e,t,r){var n=this.options,s=n.parent,o=n.sheet,a=n.jss,u=n.Renderer,l=n.generateId,c=n.scoped,h=(0,i.Z)({classes:this.classes,parent:s,sheet:o,jss:a,Renderer:u,generateId:l,scoped:c,name:e,keyframes:this.keyframes,selector:void 0},r),f=e;e in this.raw&&(f=e+"-d"+this.counter++),this.raw[f]=t,f in this.classes&&(h.selector="."+k(this.classes[f]));var p=d(f,t,h);if(!p)return null;this.register(p);var y=void 0===h.index?this.index.length:h.index;return this.index.splice(y,0,p),p},t.replace=function(e,t,r){var n=this.get(e),s=this.index.indexOf(n);n&&this.remove(n);var o=r;return-1!==s&&(o=(0,i.Z)({},r,{index:s})),this.add(e,t,o)},t.get=function(e){return this.map[e]},t.remove=function(e){this.unregister(e),delete this.raw[e.key],this.index.splice(this.index.indexOf(e),1)},t.indexOf=function(e){return this.index.indexOf(e)},t.process=function(){var e=this.options.jss.plugins;this.index.slice(0).forEach(e.onProcessRule,e)},t.register=function(e){this.map[e.key]=e,e instanceof R?(this.map[e.selector]=e,e.id&&(this.classes[e.key]=e.id)):e instanceof M&&this.keyframes&&(this.keyframes[e.name]=e.id)},t.unregister=function(e){delete this.map[e.key],e instanceof R?(delete this.map[e.selector],delete this.classes[e.key]):e instanceof M&&delete this.keyframes[e.name]},t.update=function(){var e,t,r;if("string"===typeof(arguments.length<=0?void 0:arguments[0])?(e=arguments.length<=0?void 0:arguments[0],t=arguments.length<=1?void 0:arguments[1],r=arguments.length<=2?void 0:arguments[2]):(t=arguments.length<=0?void 0:arguments[0],r=arguments.length<=1?void 0:arguments[1],e=null),e)this.updateOne(this.get(e),t,r);else for(var n=0;n<this.index.length;n++)this.updateOne(this.index[n],t,r)},t.updateOne=function(t,r,n){void 0===n&&(n=H);var i=this.options,s=i.jss.plugins,o=i.sheet;if(t.rules instanceof e)t.rules.update(r,n);else{var a=t.style;if(s.onUpdate(r,t,o,n),n.process&&a&&a!==t.style){for(var u in s.onProcessStyle(t.style,t,o),t.style){var l=t.style[u];l!==a[u]&&t.prop(u,l,K)}for(var c in a){var h=t.style[c],f=a[c];null==h&&h!==f&&t.prop(c,null,K)}}}},t.toString=function(e){for(var t="",r=this.options.sheet,n=!!r&&r.options.link,i=v(e).linebreak,s=0;s<this.index.length;s++){var o=this.index[s].toString(e);(o||n)&&(t&&(t+=i),t+=o)}return t},e}(),X=function(){function e(e,t){for(var r in this.attached=!1,this.deployed=!1,this.classes={},this.keyframes={},this.options=(0,i.Z)({},t,{sheet:this,parent:this,classes:this.classes,keyframes:this.keyframes}),t.Renderer&&(this.renderer=new t.Renderer(this)),this.rules=new Q(this.options),e)this.rules.add(r,e[r]);this.rules.process()}var t=e.prototype;return t.attach=function(){return this.attached||(this.renderer&&this.renderer.attach(),this.attached=!0,this.deployed||this.deploy()),this},t.detach=function(){return this.attached?(this.renderer&&this.renderer.detach(),this.attached=!1,this):this},t.addRule=function(e,t,r){var n=this.queue;this.attached&&!n&&(this.queue=[]);var i=this.rules.add(e,t,r);return i?(this.options.jss.plugins.onProcessRule(i),this.attached?this.deployed?(n?n.push(i):(this.insertRule(i),this.queue&&(this.queue.forEach(this.insertRule,this),this.queue=void 0)),i):i:(this.deployed=!1,i)):null},t.replaceRule=function(e,t,r){var n=this.rules.get(e);if(!n)return this.addRule(e,t,r);var i=this.rules.replace(e,t,r);return i&&this.options.jss.plugins.onProcessRule(i),this.attached?this.deployed?(this.renderer&&(i?n.renderable&&this.renderer.replaceRule(n.renderable,i):this.renderer.deleteRule(n)),i):i:(this.deployed=!1,i)},t.insertRule=function(e){this.renderer&&this.renderer.insertRule(e)},t.addRules=function(e,t){var r=[];for(var n in e){var i=this.addRule(n,e[n],t);i&&r.push(i)}return r},t.getRule=function(e){return this.rules.get(e)},t.deleteRule=function(e){var t="object"===typeof e?e:this.rules.get(e);return!(!t||this.attached&&!t.renderable)&&(this.rules.remove(t),!(this.attached&&t.renderable&&this.renderer)||this.renderer.deleteRule(t.renderable))},t.indexOf=function(e){return this.rules.indexOf(e)},t.deploy=function(){return this.renderer&&this.renderer.deploy(),this.deployed=!0,this},t.update=function(){var e;return(e=this.rules).update.apply(e,arguments),this},t.updateOne=function(e,t,r){return this.rules.updateOne(e,t,r),this},t.toString=function(e){return this.rules.toString(e)},e}(),Y=function(){function e(){this.plugins={internal:[],external:[]},this.registry={}}var t=e.prototype;return t.onCreateRule=function(e,t,r){for(var n=0;n<this.registry.onCreateRule.length;n++){var i=this.registry.onCreateRule[n](e,t,r);if(i)return i}return null},t.onProcessRule=function(e){if(!e.isProcessed){for(var t=e.options.sheet,r=0;r<this.registry.onProcessRule.length;r++)this.registry.onProcessRule[r](e,t);e.style&&this.onProcessStyle(e.style,e,t),e.isProcessed=!0}},t.onProcessStyle=function(e,t,r){for(var n=0;n<this.registry.onProcessStyle.length;n++)t.style=this.registry.onProcessStyle[n](t.style,t,r)},t.onProcessSheet=function(e){for(var t=0;t<this.registry.onProcessSheet.length;t++)this.registry.onProcessSheet[t](e)},t.onUpdate=function(e,t,r,n){for(var i=0;i<this.registry.onUpdate.length;i++)this.registry.onUpdate[i](e,t,r,n)},t.onChangeValue=function(e,t,r){for(var n=e,i=0;i<this.registry.onChangeValue.length;i++)n=this.registry.onChangeValue[i](n,t,r);return n},t.use=function(e,t){void 0===t&&(t={queue:"external"});var r=this.plugins[t.queue];-1===r.indexOf(e)&&(r.push(e),this.registry=[].concat(this.plugins.external,this.plugins.internal).reduce((function(e,t){for(var r in t)r in e&&e[r].push(t[r]);return e}),{onCreateRule:[],onProcessRule:[],onProcessStyle:[],onProcessSheet:[],onChangeValue:[],onUpdate:[]}))},e}(),ee=function(){function e(){this.registry=[]}var t=e.prototype;return t.add=function(e){var t=this.registry,r=e.options.index;if(-1===t.indexOf(e))if(0===t.length||r>=this.index)t.push(e);else for(var n=0;n<t.length;n++)if(t[n].options.index>r)return void t.splice(n,0,e)},t.reset=function(){this.registry=[]},t.remove=function(e){var t=this.registry.indexOf(e);this.registry.splice(t,1)},t.toString=function(e){for(var t=void 0===e?{}:e,r=t.attached,i=(0,n.Z)(t,["attached"]),s=v(i).linebreak,o="",a=0;a<this.registry.length;a++){var u=this.registry[a];null!=r&&u.attached!==r||(o&&(o+=s),o+=u.toString(i))}return o},(0,u.Z)(e,[{key:"index",get:function(){return 0===this.registry.length?0:this.registry[this.registry.length-1].options.index}}]),e}(),te=new ee,re="undefined"!==typeof globalThis?globalThis:"undefined"!==typeof window&&window.Math===Math?window:"undefined"!==typeof self&&self.Math===Math?self:Function("return this")(),ne="2f1acc6c3a606b082e5eef5e54414ffb";null==re[ne]&&(re[ne]=0);var ie=re[ne]++,se=function(e){void 0===e&&(e={});var t=0;return function(r,n){t+=1;var i="",s="";return n&&(n.options.classNamePrefix&&(s=n.options.classNamePrefix),null!=n.options.jss.id&&(i=String(n.options.jss.id))),e.minify?""+(s||"c")+ie+i+t:s+r.key+"-"+ie+(i?"-"+i:"")+"-"+t}},oe=function(e){var t;return function(){return t||(t=e()),t}},ae=function(e,t){try{return e.attributeStyleMap?e.attributeStyleMap.get(t):e.style.getPropertyValue(t)}catch(r){return""}},ue=function(e,t,r){try{var n=r;if(Array.isArray(r)&&(n=y(r)),e.attributeStyleMap)e.attributeStyleMap.set(t,n);else{var i=n?n.indexOf("!important"):-1,s=i>-1?n.substr(0,i-1):n;e.style.setProperty(t,s,i>-1?"important":"")}}catch(o){return!1}return!0},le=function(e,t){try{e.attributeStyleMap?e.attributeStyleMap.delete(t):e.style.removeProperty(t)}catch(r){}},ce=function(e,t){return e.selectorText=t,e.selectorText===t},he=oe((function(){return document.querySelector("head")}));function fe(e){var t=te.registry;if(t.length>0){var r=function(e,t){for(var r=0;r<e.length;r++){var n=e[r];if(n.attached&&n.options.index>t.index&&n.options.insertionPoint===t.insertionPoint)return n}return null}(t,e);if(r&&r.renderer)return{parent:r.renderer.element.parentNode,node:r.renderer.element};if(r=function(e,t){for(var r=e.length-1;r>=0;r--){var n=e[r];if(n.attached&&n.options.insertionPoint===t.insertionPoint)return n}return null}(t,e),r&&r.renderer)return{parent:r.renderer.element.parentNode,node:r.renderer.element.nextSibling}}var n=e.insertionPoint;if(n&&"string"===typeof n){var i=function(e){for(var t=he(),r=0;r<t.childNodes.length;r++){var n=t.childNodes[r];if(8===n.nodeType&&n.nodeValue.trim()===e)return n}return null}(n);if(i)return{parent:i.parentNode,node:i.nextSibling}}return!1}var de=oe((function(){var e=document.querySelector('meta[property="csp-nonce"]');return e?e.getAttribute("content"):null})),pe=function(e,t,r){try{"insertRule"in e?e.insertRule(t,r):"appendRule"in e&&e.appendRule(t)}catch(n){return!1}return e.cssRules[r]},ye=function(e,t){var r=e.cssRules.length;return void 0===t||t>r?r:t},ve=function(){function e(e){this.getPropertyValue=ae,this.setProperty=ue,this.removeProperty=le,this.setSelector=ce,this.hasInsertedRules=!1,this.cssRules=[],e&&te.add(e),this.sheet=e;var t=this.sheet?this.sheet.options:{},r=t.media,n=t.meta,i=t.element;this.element=i||function(){var e=document.createElement("style");return e.textContent="\n",e}(),this.element.setAttribute("data-jss",""),r&&this.element.setAttribute("media",r),n&&this.element.setAttribute("data-meta",n);var s=de();s&&this.element.setAttribute("nonce",s)}var t=e.prototype;return t.attach=function(){if(!this.element.parentNode&&this.sheet){!function(e,t){var r=t.insertionPoint,n=fe(t);if(!1!==n&&n.parent)n.parent.insertBefore(e,n.node);else if(r&&"number"===typeof r.nodeType){var i=r,s=i.parentNode;s&&s.insertBefore(e,i.nextSibling)}else he().appendChild(e)}(this.element,this.sheet.options);var e=Boolean(this.sheet&&this.sheet.deployed);this.hasInsertedRules&&e&&(this.hasInsertedRules=!1,this.deploy())}},t.detach=function(){if(this.sheet){var e=this.element.parentNode;e&&e.removeChild(this.element),this.sheet.options.link&&(this.cssRules=[],this.element.textContent="\n")}},t.deploy=function(){var e=this.sheet;e&&(e.options.link?this.insertRules(e.rules):this.element.textContent="\n"+e.toString()+"\n")},t.insertRules=function(e,t){for(var r=0;r<e.index.length;r++)this.insertRule(e.index[r],r,t)},t.insertRule=function(e,t,r){if(void 0===r&&(r=this.element.sheet),e.rules){var n=e,i=r;if("conditional"===e.type||"keyframes"===e.type){var s=ye(r,t);if(!1===(i=pe(r,n.toString({children:!1}),s)))return!1;this.refCssRule(e,s,i)}return this.insertRules(n.rules,i),i}var o=e.toString();if(!o)return!1;var a=ye(r,t),u=pe(r,o,a);return!1!==u&&(this.hasInsertedRules=!0,this.refCssRule(e,a,u),u)},t.refCssRule=function(e,t,r){e.renderable=r,e.options.parent instanceof X&&this.cssRules.splice(t,0,r)},t.deleteRule=function(e){var t=this.element.sheet,r=this.indexOf(e);return-1!==r&&(t.deleteRule(r),this.cssRules.splice(r,1),!0)},t.indexOf=function(e){return this.cssRules.indexOf(e)},t.replaceRule=function(e,t){var r=this.indexOf(e);return-1!==r&&(this.element.sheet.deleteRule(r),this.cssRules.splice(r,1),this.insertRule(t,r))},t.getRules=function(){return this.element.sheet.cssRules},e}(),ge=0,me=function(){function e(e){this.id=ge++,this.version="10.10.0",this.plugins=new Y,this.options={id:{minify:!1},createGenerateId:se,Renderer:a?ve:null,plugins:[]},this.generateId=se({minify:!1});for(var t=0;t<F.length;t++)this.plugins.use(F[t],{queue:"internal"});this.setup(e)}var t=e.prototype;return t.setup=function(e){return void 0===e&&(e={}),e.createGenerateId&&(this.options.createGenerateId=e.createGenerateId),e.id&&(this.options.id=(0,i.Z)({},this.options.id,e.id)),(e.createGenerateId||e.id)&&(this.generateId=this.options.createGenerateId(this.options.id)),null!=e.insertionPoint&&(this.options.insertionPoint=e.insertionPoint),"Renderer"in e&&(this.options.Renderer=e.Renderer),e.plugins&&this.use.apply(this,e.plugins),this},t.createStyleSheet=function(e,t){void 0===t&&(t={});var r=t.index;"number"!==typeof r&&(r=0===te.index?0:te.index+1);var n=new X(e,(0,i.Z)({},t,{jss:this,generateId:t.generateId||this.generateId,insertionPoint:this.options.insertionPoint,Renderer:this.options.Renderer,index:r}));return this.plugins.onProcessSheet(n),n},t.removeStyleSheet=function(e){return e.detach(),te.remove(e),this},t.createRule=function(e,t,r){if(void 0===t&&(t={}),void 0===r&&(r={}),"object"===typeof e)return this.createRule(void 0,e,t);var n=(0,i.Z)({},r,{name:e,jss:this,Renderer:this.options.Renderer});n.generateId||(n.generateId=this.generateId),n.classes||(n.classes={}),n.keyframes||(n.keyframes={});var s=d(e,t,n);return s&&this.plugins.onProcessRule(s),s},t.use=function(){for(var e=this,t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return r.forEach((function(t){e.plugins.use(t)})),this},e}(),be=function(e){return new me(e)},xe="object"===typeof CSS&&null!=CSS&&"number"in CSS;function ke(e){var t=null;for(var r in e){var n=e[r],i=typeof n;if("function"===i)t||(t={}),t[r]=n;else if("object"===i&&null!==n&&!Array.isArray(n)){var s=ke(n);s&&(t||(t={}),t[r]=s)}}return t}be();function Se(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.baseClasses,r=e.newClasses;e.Component;if(!r)return t;var n=(0,i.Z)({},t);return Object.keys(r).forEach((function(e){r[e]&&(n[e]="".concat(t[e]," ").concat(r[e]))})),n}var Re={set:function(e,t,r,n){var i=e.get(t);i||(i=new Map,e.set(t,i)),i.set(r,n)},get:function(e,t,r){var n=e.get(t);return n?n.get(r):void 0},delete:function(e,t,r){e.get(t).delete(r)}},we=Re,Pe=r(20201),Ce=r(94947),je=["checked","disabled","error","focused","focusVisible","required","expanded","selected"];var Oe=Date.now(),Ze="fnValues"+Oe,Ae="fnStyle"+ ++Oe,Ie=function(){return{onCreateRule:function(e,t,r){if("function"!==typeof t)return null;var n=d(e,{},r);return n[Ae]=t,n},onProcessStyle:function(e,t){if(Ze in t||Ae in t)return e;var r={};for(var n in e){var i=e[n];"function"===typeof i&&(delete e[n],r[n]=i)}return t[Ze]=r,e},onUpdate:function(e,t,r,n){var i=t,s=i[Ae];s&&(i.style=s(e)||{});var o=i[Ze];if(o)for(var a in o)i.prop(a,o[a](e),n)}}},Me="@global",Ne="@global ",Ee=function(){function e(e,t,r){for(var n in this.type="global",this.at=Me,this.isProcessed=!1,this.key=e,this.options=r,this.rules=new Q((0,i.Z)({},r,{parent:this})),t)this.rules.add(n,t[n]);this.rules.process()}var t=e.prototype;return t.getRule=function(e){return this.rules.get(e)},t.addRule=function(e,t,r){var n=this.rules.add(e,t,r);return n&&this.options.jss.plugins.onProcessRule(n),n},t.replaceRule=function(e,t,r){var n=this.rules.replace(e,t,r);return n&&this.options.jss.plugins.onProcessRule(n),n},t.indexOf=function(e){return this.rules.indexOf(e)},t.toString=function(e){return this.rules.toString(e)},e}(),Te=function(){function e(e,t,r){this.type="global",this.at=Me,this.isProcessed=!1,this.key=e,this.options=r;var n=e.substr(8);this.rule=r.jss.createRule(n,t,(0,i.Z)({},r,{parent:this}))}return e.prototype.toString=function(e){return this.rule?this.rule.toString(e):""},e}(),qe=/\s*,\s*/g;function Ve(e,t){for(var r=e.split(qe),n="",i=0;i<r.length;i++)n+=t+" "+r[i].trim(),r[i+1]&&(n+=", ");return n}var ze=function(){return{onCreateRule:function(e,t,r){if(!e)return null;if(e===Me)return new Ee(e,t,r);if("@"===e[0]&&e.substr(0,8)===Ne)return new Te(e,t,r);var n=r.parent;return n&&("global"===n.type||n.options.parent&&"global"===n.options.parent.type)&&(r.scoped=!1),r.selector||!1!==r.scoped||(r.selector=e),null},onProcessRule:function(e,t){"style"===e.type&&t&&(function(e,t){var r=e.options,n=e.style,s=n?n[Me]:null;if(s){for(var o in s)t.addRule(o,s[o],(0,i.Z)({},r,{selector:Ve(o,e.selector)}));delete n[Me]}}(e,t),function(e,t){var r=e.options,n=e.style;for(var s in n)if("@"===s[0]&&s.substr(0,Me.length)===Me){var o=Ve(s.substr(Me.length),e.selector);t.addRule(o,n[s],(0,i.Z)({},r,{selector:o})),delete n[s]}}(e,t))}}},Ge=/\s*,\s*/g,We=/&/g,Ue=/\$([\w-]+)/g;var Je=function(){function e(e,t){return function(r,n){var i=e.getRule(n)||t&&t.getRule(n);return i?i.selector:n}}function t(e,t){for(var r=t.split(Ge),n=e.split(Ge),i="",s=0;s<r.length;s++)for(var o=r[s],a=0;a<n.length;a++){var u=n[a];i&&(i+=", "),i+=-1!==u.indexOf("&")?u.replace(We,o):o+" "+u}return i}function r(e,t,r){if(r)return(0,i.Z)({},r,{index:r.index+1});var n=e.options.nestingLevel;n=void 0===n?1:n+1;var s=(0,i.Z)({},e.options,{nestingLevel:n,index:t.indexOf(e)+1});return delete s.name,s}return{onProcessStyle:function(n,s,o){if("style"!==s.type)return n;var a,u,l=s,c=l.options.parent;for(var h in n){var f=-1!==h.indexOf("&"),d="@"===h[0];if(f||d){if(a=r(l,c,a),f){var p=t(h,l.selector);u||(u=e(c,o)),p=p.replace(Ue,u);var y=l.key+"-"+h;"replaceRule"in c?c.replaceRule(y,n[h],(0,i.Z)({},a,{selector:p})):c.addRule(y,n[h],(0,i.Z)({},a,{selector:p}))}else d&&c.addRule(h,{},a).addRule(l.key,n[h],{selector:l.selector});delete n[h]}}return n}}},$e=/[A-Z]/g,Be=/^ms-/,Le={};function _e(e){return"-"+e.toLowerCase()}var De=function(e){if(Le.hasOwnProperty(e))return Le[e];var t=e.replace($e,_e);return Le[e]=Be.test(t)?"-"+t:t};function Fe(e){var t={};for(var r in e){t[0===r.indexOf("--")?r:De(r)]=e[r]}return e.fallbacks&&(Array.isArray(e.fallbacks)?t.fallbacks=e.fallbacks.map(Fe):t.fallbacks=Fe(e.fallbacks)),t}var He=function(){return{onProcessStyle:function(e){if(Array.isArray(e)){for(var t=0;t<e.length;t++)e[t]=Fe(e[t]);return e}return Fe(e)},onChangeValue:function(e,t,r){if(0===t.indexOf("--"))return e;var n=De(t);return t===n?e:(r.prop(n,e),null)}}},Ke=xe&&CSS?CSS.px:"px",Qe=xe&&CSS?CSS.ms:"ms",Xe=xe&&CSS?CSS.percent:"%";function Ye(e){var t=/(-[a-z])/g,r=function(e){return e[1].toUpperCase()},n={};for(var i in e)n[i]=e[i],n[i.replace(t,r)]=e[i];return n}var et=Ye({"animation-delay":Qe,"animation-duration":Qe,"background-position":Ke,"background-position-x":Ke,"background-position-y":Ke,"background-size":Ke,border:Ke,"border-bottom":Ke,"border-bottom-left-radius":Ke,"border-bottom-right-radius":Ke,"border-bottom-width":Ke,"border-left":Ke,"border-left-width":Ke,"border-radius":Ke,"border-right":Ke,"border-right-width":Ke,"border-top":Ke,"border-top-left-radius":Ke,"border-top-right-radius":Ke,"border-top-width":Ke,"border-width":Ke,"border-block":Ke,"border-block-end":Ke,"border-block-end-width":Ke,"border-block-start":Ke,"border-block-start-width":Ke,"border-block-width":Ke,"border-inline":Ke,"border-inline-end":Ke,"border-inline-end-width":Ke,"border-inline-start":Ke,"border-inline-start-width":Ke,"border-inline-width":Ke,"border-start-start-radius":Ke,"border-start-end-radius":Ke,"border-end-start-radius":Ke,"border-end-end-radius":Ke,margin:Ke,"margin-bottom":Ke,"margin-left":Ke,"margin-right":Ke,"margin-top":Ke,"margin-block":Ke,"margin-block-end":Ke,"margin-block-start":Ke,"margin-inline":Ke,"margin-inline-end":Ke,"margin-inline-start":Ke,padding:Ke,"padding-bottom":Ke,"padding-left":Ke,"padding-right":Ke,"padding-top":Ke,"padding-block":Ke,"padding-block-end":Ke,"padding-block-start":Ke,"padding-inline":Ke,"padding-inline-end":Ke,"padding-inline-start":Ke,"mask-position-x":Ke,"mask-position-y":Ke,"mask-size":Ke,height:Ke,width:Ke,"min-height":Ke,"max-height":Ke,"min-width":Ke,"max-width":Ke,bottom:Ke,left:Ke,top:Ke,right:Ke,inset:Ke,"inset-block":Ke,"inset-block-end":Ke,"inset-block-start":Ke,"inset-inline":Ke,"inset-inline-end":Ke,"inset-inline-start":Ke,"box-shadow":Ke,"text-shadow":Ke,"column-gap":Ke,"column-rule":Ke,"column-rule-width":Ke,"column-width":Ke,"font-size":Ke,"font-size-delta":Ke,"letter-spacing":Ke,"text-decoration-thickness":Ke,"text-indent":Ke,"text-stroke":Ke,"text-stroke-width":Ke,"word-spacing":Ke,motion:Ke,"motion-offset":Ke,outline:Ke,"outline-offset":Ke,"outline-width":Ke,perspective:Ke,"perspective-origin-x":Xe,"perspective-origin-y":Xe,"transform-origin":Xe,"transform-origin-x":Xe,"transform-origin-y":Xe,"transform-origin-z":Xe,"transition-delay":Qe,"transition-duration":Qe,"vertical-align":Ke,"flex-basis":Ke,"shape-margin":Ke,size:Ke,gap:Ke,grid:Ke,"grid-gap":Ke,"row-gap":Ke,"grid-row-gap":Ke,"grid-column-gap":Ke,"grid-template-rows":Ke,"grid-template-columns":Ke,"grid-auto-rows":Ke,"grid-auto-columns":Ke,"box-shadow-x":Ke,"box-shadow-y":Ke,"box-shadow-blur":Ke,"box-shadow-spread":Ke,"font-line-height":Ke,"text-shadow-x":Ke,"text-shadow-y":Ke,"text-shadow-blur":Ke});function tt(e,t,r){if(null==t)return t;if(Array.isArray(t))for(var n=0;n<t.length;n++)t[n]=tt(e,t[n],r);else if("object"===typeof t)if("fallbacks"===e)for(var i in t)t[i]=tt(i,t[i],r);else for(var s in t)t[s]=tt(e+"-"+s,t[s],r);else if("number"===typeof t&&!1===isNaN(t)){var o=r[e]||et[e];return!o||0===t&&o===Ke?t.toString():"function"===typeof o?o(t).toString():""+t+o}return t}var rt=function(e){void 0===e&&(e={});var t=Ye(e);return{onProcessStyle:function(e,r){if("style"!==r.type)return e;for(var n in e)e[n]=tt(n,e[n],t);return e},onChangeValue:function(e,r){return tt(r,e,t)}}},nt=r(93433),it="",st="",ot="",at="",ut=a&&"ontouchstart"in document.documentElement;if(a){var lt={Moz:"-moz-",ms:"-ms-",O:"-o-",Webkit:"-webkit-"},ct=document.createElement("p").style;for(var ht in lt)if(ht+"Transform"in ct){it=ht,st=lt[ht];break}"Webkit"===it&&"msHyphens"in ct&&(it="ms",st=lt.ms,at="edge"),"Webkit"===it&&"-apple-trailing-word"in ct&&(ot="apple")}var ft={js:it,css:st,vendor:ot,browser:at,isTouch:ut};var dt={noPrefill:["appearance"],supportedProperty:function(e){return"appearance"===e&&("ms"===ft.js?"-webkit-"+e:ft.css+e)}},pt={noPrefill:["color-adjust"],supportedProperty:function(e){return"color-adjust"===e&&("Webkit"===ft.js?ft.css+"print-"+e:e)}},yt=/[-\s]+(.)?/g;function vt(e,t){return t?t.toUpperCase():""}function gt(e){return e.replace(yt,vt)}function mt(e){return gt("-"+e)}var bt,xt={noPrefill:["mask"],supportedProperty:function(e,t){if(!/^mask/.test(e))return!1;if("Webkit"===ft.js){var r="mask-image";if(gt(r)in t)return e;if(ft.js+mt(r)in t)return ft.css+e}return e}},kt={noPrefill:["text-orientation"],supportedProperty:function(e){return"text-orientation"===e&&("apple"!==ft.vendor||ft.isTouch?e:ft.css+e)}},St={noPrefill:["transform"],supportedProperty:function(e,t,r){return"transform"===e&&(r.transform?e:ft.css+e)}},Rt={noPrefill:["transition"],supportedProperty:function(e,t,r){return"transition"===e&&(r.transition?e:ft.css+e)}},wt={noPrefill:["writing-mode"],supportedProperty:function(e){return"writing-mode"===e&&("Webkit"===ft.js||"ms"===ft.js&&"edge"!==ft.browser?ft.css+e:e)}},Pt={noPrefill:["user-select"],supportedProperty:function(e){return"user-select"===e&&("Moz"===ft.js||"ms"===ft.js||"apple"===ft.vendor?ft.css+e:e)}},Ct={supportedProperty:function(e,t){return!!/^break-/.test(e)&&("Webkit"===ft.js?"WebkitColumn"+mt(e)in t&&ft.css+"column-"+e:"Moz"===ft.js&&("page"+mt(e)in t&&"page-"+e))}},jt={supportedProperty:function(e,t){if(!/^(border|margin|padding)-inline/.test(e))return!1;if("Moz"===ft.js)return e;var r=e.replace("-inline","");return ft.js+mt(r)in t&&ft.css+r}},Ot={supportedProperty:function(e,t){return gt(e)in t&&e}},Zt={supportedProperty:function(e,t){var r=mt(e);return"-"===e[0]||"-"===e[0]&&"-"===e[1]?e:ft.js+r in t?ft.css+e:"Webkit"!==ft.js&&"Webkit"+r in t&&"-webkit-"+e}},At={supportedProperty:function(e){return"scroll-snap"===e.substring(0,11)&&("ms"===ft.js?""+ft.css+e:e)}},It={supportedProperty:function(e){return"overscroll-behavior"===e&&("ms"===ft.js?ft.css+"scroll-chaining":e)}},Mt={"flex-grow":"flex-positive","flex-shrink":"flex-negative","flex-basis":"flex-preferred-size","justify-content":"flex-pack",order:"flex-order","align-items":"flex-align","align-content":"flex-line-pack"},Nt={supportedProperty:function(e,t){var r=Mt[e];return!!r&&(ft.js+mt(r)in t&&ft.css+r)}},Et={flex:"box-flex","flex-grow":"box-flex","flex-direction":["box-orient","box-direction"],order:"box-ordinal-group","align-items":"box-align","flex-flow":["box-orient","box-direction"],"justify-content":"box-pack"},Tt=Object.keys(Et),qt=function(e){return ft.css+e},Vt={supportedProperty:function(e,t,r){var n=r.multiple;if(Tt.indexOf(e)>-1){var i=Et[e];if(!Array.isArray(i))return ft.js+mt(i)in t&&ft.css+i;if(!n)return!1;for(var s=0;s<i.length;s++)if(!(ft.js+mt(i[0])in t))return!1;return i.map(qt)}return!1}},zt=[dt,pt,xt,kt,St,Rt,wt,Pt,Ct,jt,Ot,Zt,At,It,Nt,Vt],Gt=zt.filter((function(e){return e.supportedProperty})).map((function(e){return e.supportedProperty})),Wt=zt.filter((function(e){return e.noPrefill})).reduce((function(e,t){return e.push.apply(e,(0,nt.Z)(t.noPrefill)),e}),[]),Ut={};if(a){bt=document.createElement("p");var Jt=window.getComputedStyle(document.documentElement,"");for(var $t in Jt)isNaN($t)||(Ut[Jt[$t]]=Jt[$t]);Wt.forEach((function(e){return delete Ut[e]}))}function Bt(e,t){if(void 0===t&&(t={}),!bt)return e;if(null!=Ut[e])return Ut[e];"transition"!==e&&"transform"!==e||(t[e]=e in bt.style);for(var r=0;r<Gt.length&&(Ut[e]=Gt[r](e,bt.style,t),!Ut[e]);r++);try{bt.style[e]=""}catch(n){return!1}return Ut[e]}var Lt,_t={},Dt={transition:1,"transition-property":1,"-webkit-transition":1,"-webkit-transition-property":1},Ft=/(^\s*[\w-]+)|, (\s*[\w-]+)(?![^()]*\))/g;function Ht(e,t,r){if("var"===t)return"var";if("all"===t)return"all";if("all"===r)return", all";var n=t?Bt(t):", "+Bt(r);return n||(t||r)}function Kt(e,t){var r=t;if(!Lt||"content"===e)return t;if("string"!==typeof r||!isNaN(parseInt(r,10)))return r;var n=e+r;if(null!=_t[n])return _t[n];try{Lt.style[e]=r}catch(i){return _t[n]=!1,!1}if(Dt[e])r=r.replace(Ft,Ht);else if(""===Lt.style[e]&&("-ms-flex"===(r=ft.css+r)&&(Lt.style[e]="-ms-flexbox"),Lt.style[e]=r,""===Lt.style[e]))return _t[n]=!1,!1;return Lt.style[e]="",_t[n]=r,_t[n]}a&&(Lt=document.createElement("p"));var Qt=function(){function e(t){for(var r in t){var n=t[r];if("fallbacks"===r&&Array.isArray(n))t[r]=n.map(e);else{var i=!1,s=Bt(r);s&&s!==r&&(i=!0);var o=!1,a=Kt(s,y(n));a&&a!==n&&(o=!0),(i||o)&&(i&&delete t[r],t[s||r]=a||n)}}return t}return{onProcessRule:function(e){if("keyframes"===e.type){var t=e;t.at=function(e){return"-"===e[1]||"ms"===ft.js?e:"@"+ft.css+"keyframes"+e.substr(10)}(t.at)}},onProcessStyle:function(t,r){return"style"!==r.type?t:e(t)},onChangeValue:function(e,t){return Kt(t,y(e))||e}}};var Xt=function(){var e=function(e,t){return e.length===t.length?e>t?1:-1:e.length-t.length};return{onProcessStyle:function(t,r){if("style"!==r.type)return t;for(var n={},i=Object.keys(t).sort(e),s=0;s<i.length;s++)n[i[s]]=t[i[s]];return n}}};r(46417);var Yt=be({plugins:[Ie(),ze(),Je(),He(),rt(),"undefined"===typeof window?null:Qt(),Xt()]}),er=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.disableGlobal,r=void 0!==t&&t,n=e.productionPrefix,i=void 0===n?"jss":n,s=e.seed,o=void 0===s?"":s,a=""===o?"":"".concat(o,"-"),u=0,l=function(){return u+=1};return function(e,t){var n=t.options.name;if(n&&0===n.indexOf("Mui")&&!t.options.link&&!r){if(-1!==je.indexOf(e.key))return"Mui-".concat(e.key);var s="".concat(a).concat(n,"-").concat(e.key);return t.options.theme[Ce.Z]&&""===o?"".concat(s,"-").concat(l()):s}return"".concat(a).concat(i).concat(l())}}(),tr={disableGeneration:!1,generateClassName:er,jss:Yt,sheetsCache:null,sheetsManager:new Map,sheetsRegistry:null},rr=s.createContext(tr);var nr=-1e9;var ir=r(13019),sr=r(50114),or=["variant"];function ar(e){return 0===e.length}function ur(e){var t="function"===typeof e;return{create:function(r,s){var o;try{o=t?e(r):e}catch(c){throw c}if(!s||!r.components||!r.components[s]||!r.components[s].styleOverrides&&!r.components[s].variants)return o;var a=r.components[s].styleOverrides||{},u=r.components[s].variants||[],l=(0,i.Z)({},o);return Object.keys(a).forEach((function(e){l[e]=(0,ir.Z)(l[e]||{},a[e])})),u.forEach((function(e){var t=function(e){var t=e.variant,r=(0,n.Z)(e,or),i=t||"";return Object.keys(r).sort().forEach((function(t){i+="color"===t?ar(i)?e[t]:(0,sr.Z)(e[t]):"".concat(ar(i)?t:(0,sr.Z)(t)).concat((0,sr.Z)(e[t].toString()))})),i}(e.props);l[t]=(0,ir.Z)(l[t]||{},e.style)})),l},options:{}}}var lr={},cr=["name","classNamePrefix","Component","defaultTheme"];function hr(e,t){var r=e.state,n=e.theme,s=e.stylesOptions,o=e.stylesCreator,a=e.name;if(!s.disableGeneration){var u=we.get(s.sheetsManager,o,n);u||(u={refs:0,staticSheet:null,dynamicStyles:null},we.set(s.sheetsManager,o,n,u));var l=(0,i.Z)({},o.options,s,{theme:n,flip:"boolean"===typeof s.flip?s.flip:"rtl"===n.direction});l.generateId=l.serverGenerateClassName||l.generateClassName;var c=s.sheetsRegistry;if(0===u.refs){var h;s.sheetsCache&&(h=we.get(s.sheetsCache,o,n));var f=o.create(n,a);h||((h=s.jss.createStyleSheet(f,(0,i.Z)({link:!1},l))).attach(),s.sheetsCache&&we.set(s.sheetsCache,o,n,h)),c&&c.add(h),u.staticSheet=h,u.dynamicStyles=ke(f)}if(u.dynamicStyles){var d=s.jss.createStyleSheet(u.dynamicStyles,(0,i.Z)({link:!0},l));d.update(t),d.attach(),r.dynamicSheet=d,r.classes=Se({baseClasses:u.staticSheet.classes,newClasses:d.classes}),c&&c.add(d)}else r.classes=u.staticSheet.classes;u.refs+=1}}function fr(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=t.name,o=t.classNamePrefix,a=t.Component,u=t.defaultTheme,l=void 0===u?lr:u,c=(0,n.Z)(t,cr),h=ur(e),f=r||o||"makeStyles";h.options={index:nr+=1,name:r,meta:f,classNamePrefix:f};return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=(0,Pe.Z)()||l,n=(0,i.Z)({},s.useContext(rr),c),o=s.useRef(),u=s.useRef();!function(e,t){var r,n=s.useRef([]),i=s.useMemo((function(){return{}}),t);n.current!==i&&(n.current=i,r=e()),s.useEffect((function(){return function(){r&&r()}}),[i])}((function(){var i={name:r,state:{},stylesCreator:h,stylesOptions:n,theme:t};return hr(i,e),u.current=!1,o.current=i,function(){!function(e){var t=e.state,r=e.theme,n=e.stylesOptions,i=e.stylesCreator;if(!n.disableGeneration){var s=we.get(n.sheetsManager,i,r);s.refs-=1;var o=n.sheetsRegistry;0===s.refs&&(we.delete(n.sheetsManager,i,r),n.jss.removeStyleSheet(s.staticSheet),o&&o.remove(s.staticSheet)),t.dynamicSheet&&(n.jss.removeStyleSheet(t.dynamicSheet),o&&o.remove(t.dynamicSheet))}}(i)}}),[t,h]),s.useEffect((function(){u.current&&function(e,t){var r=e.state;r.dynamicSheet&&r.dynamicSheet.update(t)}(o.current,e),u.current=!0}));var f=function(e,t,r){var n=e.state;if(e.stylesOptions.disableGeneration)return t||{};n.cacheClasses||(n.cacheClasses={value:null,lastProp:null,lastJSS:{}});var i=!1;return n.classes!==n.cacheClasses.lastJSS&&(n.cacheClasses.lastJSS=n.classes,i=!0),t!==n.cacheClasses.lastProp&&(n.cacheClasses.lastProp=t,i=!0),i&&(n.cacheClasses.value=Se({baseClasses:n.cacheClasses.lastJSS,newClasses:t,Component:r})),n.cacheClasses.value}(o.current,e.classes,a);return f}}}}]);