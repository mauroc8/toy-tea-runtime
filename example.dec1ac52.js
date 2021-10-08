parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"UNBC":[function(require,module,exports) {
"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t){0}function r(e,t){if(e===t)return!0;if(e instanceof Array&&t instanceof Array)return e.length===t.length&&e.every(function(e,n){return r(e,t[n])});if(n(e)&&n(t)){for(var o=0,u=Object.keys(e);o<u.length;o++){if(!((s=u[o])in t&&r(e[s],t[s])))return!1}for(var i=0,f=Object.keys(t);i<f.length;i++){var s;if(!((s=f[i])in e))return!1}return!0}return!(!Number.isNaN(e)||!Number.isNaN(t))||e===t}function n(t){return"object"===e(t)&&null!==t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.isObject=exports.equals=exports.debugException=void 0,exports.debugException=t,exports.equals=r,exports.isObject=n;
},{}],"G2mG":[function(require,module,exports) {
"use strict";var e=this&&this.__createBinding||(Object.create?function(e,t,n,r){void 0===r&&(r=n),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,r){void 0===r&&(r=n),e[r]=t[n]}),t=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),n=this&&this.__importStar||function(n){if(n&&n.__esModule)return n;var r={};if(null!=n)for(var a in n)"default"!==a&&Object.prototype.hasOwnProperty.call(n,a)&&e(r,n,a);return t(r,n),r};Object.defineProperty(exports,"__esModule",{value:!0}),exports.patch=exports.init=void 0;var r=n(require("./Utils"));function a(e,t,n){var r=u(t,n);return e.replaceWith(r),Object.freeze({node:r,html:t})}function o(e,t,n){if(e.html===t)return e;switch(e.html.nodeType){case"text":return a(e.node,t,n);case"node":switch(t.nodeType){case"text":return a(e.node,t,n);default:return e.html.tagName===t.tagName&&e.node instanceof Element?(l(e.node,e.html.attributes,t.attributes,n),p(e.node,e.html.children,t.children,n),Object.freeze({html:t,node:e.node})):a(e.node,t,n)}}}function u(e,t){switch(e.nodeType){case"node":for(var n=document.createElement(e.tagName),r=0,a=e.attributes;r<a.length;r++){i(a[r],t,n)}for(var o=0,l=e.children;o<l.length;o++){var c=l[o];n.appendChild(u(c,t))}return n;case"text":return document.createTextNode(e.text)}}function i(e,t,n){try{switch(e.tag){case"attribute":return void n.setAttribute(e.name,e.value);case"property":return void(n[e.name]=e.value);case"eventHandler":return void(n["on"+e.eventName]=function(n){return t(e.handler(n))});case"style":return void(e.property.startsWith("--")?n.style.setProperty(e.property,e.value):n.style[e.property]="float"===e.value?"cssFloat":e.value);case"class":""!==e.value&&n.classList.add(e.value)}}catch(a){r.debugException("applyAttribute",a)}}function l(e,t,n,r){c(t,n,function(t,n,a){d(t,n)||s(t,n,r,e)},function(t,n){v(t,e)},function(t,n){i(t,r,e)})}function c(e,t,n,r,a){for(var o=[],u=0;u<Math.min(e.length,t.length);u++)o.push(n(e[u],t[u],u));for(u=t.length;u<e.length;u++)o.push(r(e[u],u));for(u=e.length;u<t.length;u++)o.push(a(t[u],u));return o}function s(e,t,n,r){"property"!==e.tag||"property"!==t.tag||e.name!==t.name?(v(e,r),i(t,n,r)):r[t.name]!==t.value&&(r[t.name]=t.value)}function d(e,t){return"attribute"===e.tag&&"attribute"===t.tag?e.name===t.name&&e.value===t.value:"property"===e.tag&&"property"===t.tag?e.name===t.name&&r.equals(e.value,t.value):"eventHandler"===e.tag&&"eventHandler"===t.tag?e.eventName===t.eventName&&e.handler===t.handler:"style"===e.tag&&"style"===t.tag?e.property===t.property&&e.value===t.value:"class"===e.tag&&"class"===t.tag&&e.value===t.value}function v(e,t){try{switch(e.tag){case"attribute":return void t.removeAttribute(e.name);case"property":return void(t[e.name]=void 0);case"eventHandler":return void(t["on"+e.eventName]=void 0);case"style":return void(t.style[e.property]="");case"class":return void t.classList.remove(e.value)}}catch(n){r.debugException("removeAttribute",n)}}function p(e,t,n,r){var a=Array.from(e.childNodes);c(t,n,function(t,n,u){var i=a[u];if(!(i instanceof Element||i instanceof Text))throw{parent:e,currentHtml:t,newHtml:n,$child:i};o({node:i,html:t},n,r)},function(e,t){a[t].remove()},function(t,n){e.appendChild(u(t,r))})}exports.init=a,exports.patch=o;
},{"./Utils":"UNBC"}],"gIhT":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.start=void 0;var t=require("./private/Reconciliation");function r(t,r,o,u){var c=e(r,o,t,a);function i(t){try{var r=u(c.currentState,t);c=n(c,r,o,i)}catch(e){console.error(e)}}function a(t){requestAnimationFrame(function(){return i(t)})}return a}function e(r,e,n,o){return{currentState:r,dom:(0,t.init)(n,e(r),o)}}function n(r,e,n,o){return{dom:r.currentState===e?r.dom:(0,t.patch)(r.dom,n(e),o),currentState:e}}exports.start=r;
},{"./private/Reconciliation":"G2mG"}],"BlFt":[function(require,module,exports) {
"use strict";function t(t,e,r){return{type:"Html",nodeType:"node",tagName:t,attributes:e,children:r}}function e(t){return{type:"Html",nodeType:"text",text:t}}function r(e,n){switch(e.nodeType){case"node":return t(e.tagName,e.attributes.map(function(t){return s(t,n)}),e.children.map(function(t){return r(t,n)}));case"text":return e}}function n(t,e){return{tag:"attribute",name:t,value:e}}function o(t,e){return{tag:"property",name:t,value:e}}function a(t,e){return{tag:"eventHandler",eventName:t,handler:e}}function u(t,e){return{tag:"style",property:t,value:e}}function p(t){return{tag:"class",value:t}}function s(t,e){switch(t.tag){case"eventHandler":return{tag:"eventHandler",eventName:t.eventName,handler:function(r){return e(t.handler(r))}};default:return t}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.mapAttribute=exports.class_=exports.style=exports.on=exports.property=exports.attribute=exports.map=exports.text=exports.node=void 0,exports.node=t,exports.text=e,exports.map=r,exports.attribute=n,exports.property=o,exports.on=a,exports.style=u,exports.class_=p,exports.mapAttribute=s;
},{}],"QCba":[function(require,module,exports) {
"use strict";var t=this&&this.__assign||function(){return(t=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}).apply(this,arguments)},e=this&&this.__spreadArray||function(t,e,n){if(n||2===arguments.length)for(var r,i=0,o=e.length;i<o;i++)!r&&i in e||(r||(r=Array.prototype.slice.call(e,0,i)),r[i]=e[i]);return t.concat(r||Array.prototype.slice.call(e))};Object.defineProperty(exports,"__esModule",{value:!0});var n=require("../src/Runtime"),r=require("../src/Html");function i(t){throw t}var o=(0,n.start)(document.querySelector("#root")||i("No #root node"),s(),l,u);function a(t,e){return{id:t,description:e,done:!1}}function s(){return{newTaskInput:"",tasks:[]}}function u(n,r){switch(r.tag){case"onNewTaskInput":return t(t({},n),{newTaskInput:r.value});case"createTask":var i=(new Date).getUTCMilliseconds();return t(t({},n),{newTaskInput:"",tasks:e([a(i,r.description)],n.tasks,!0)});case"toggleTaskStatus":return t(t({},n),{tasks:c(r.id,n.tasks)});case"editTaskDescription":return t(t({},n),{tasks:d(r.id,r.description,n.tasks)});case"deleteTask":return t(t({},n),{tasks:n.tasks.filter(function(t){return t.id!==r.id})})}}function c(e,n){return n.map(function(n){return n.id===e?t(t({},n),{done:!n.done}):n})}function d(e,n,r){return r.map(function(r){return r.id===e?t(t({},r),{description:n}):r})}function l(t){return(0,r.node)("div",[(0,r.style)("font-family","sans-serif"),(0,r.style)("max-width","800px"),(0,r.style)("margin","20px auto")],[(0,r.node)("h1",[],[(0,r.text)("To Do List")]),(0,r.node)("p",[],[(0,r.node)("i",[],[(0,r.text)("Toy Virtual DOM example")])]),p(t.newTaskInput),f(t.tasks)])}function p(t){return x([],[v({id:"newTaskInput",label:(0,r.text)("Create a new task: "),inputValue:t,onChange:function(t){return{tag:"onNewTaskInput",value:t}}}),T({tag:"createTask",description:t},[],[(0,r.text)("Create")])])}function f(t){return(0,r.node)("div",[],t.map(y))}function y(t){return x([(0,r.style)("margin","10px 0"),(0,r.style)("gap","10px"),(0,r.style)("align-items","baseline")],[k(t.id,t.done),g(t),t.done?h(t.id):(0,r.text)("")])}function k(t,e){return(0,r.node)("input",[(0,r.property)("type","checkbox"),(0,r.on)("change",function(e){return{tag:"toggleTaskStatus",id:t}}),(0,r.attribute)("aria-label","Is done"),(0,r.property)("checked",e)],[])}function g(t){return t.done?(0,r.node)("div",[(0,r.style)("text-decoration","line-through")],[(0,r.text)(t.description)]):v({id:"task_"+t.id+"_description",label:(0,r.node)("div",[(0,r.style)("display","none")],[(0,r.text)("Change task description")]),inputValue:t.description,onChange:function(e){return{tag:"editTaskDescription",id:t.id,description:e}}})}function h(t){return T({tag:"deleteTask",id:t},[],[(0,r.text)("Delete")])}function x(t,n){return(0,r.node)("div",e([(0,r.style)("display","flex"),(0,r.style)("flex-direction","row")],t,!0),n)}function T(t,n,i){return(0,r.node)("button",e([(0,r.on)("click",function(e){return t})],n,!0),i)}function v(t){return(0,r.node)("label",e([(0,r.property)("id",t.id)],t.labelAttributes||[],!0),[t.label,(0,r.node)("input",e([(0,r.property)("type",t.type||"text"),(0,r.property)("value",t.inputValue),(0,r.on)("change",function(e){return t.onChange(e.target.value)})],t.inputAttributes||[],!0),[])])}
},{"../src/Runtime":"gIhT","../src/Html":"BlFt"}]},{},["QCba"], null)
//# sourceMappingURL=example.dec1ac52.js.map