var Fiddler_Config=function(){"use strict";var e={encoding:"utf-8",enable_auto_response:!0,disable_cache:!1,rules:[]},t="Fiddler";return{init:function(){this.loadConfig()},clearRules:function(){e.rules=[]},getEncoding:function(){return e.encoding},setEncoding:function(t){return e.encoding=t,this},getConfig:function(t){return e[t]||""},setConfig:function(t,n){e[t]=n,this.saveConfig()},addRule:function(t){e.rules.push(t),this.saveConfig()},getRules:function(){return e.rules||[]},loadConfig:function(){var n=localStorage.getItem(t)||"{}";n=JSON.parse(n),Fiddler.mix(e,n,!0)},saveConfig:function(){var n=JSON.stringify(e);localStorage.setItem(t,n)}}}(),Fiddler_Event=function(){"use strict";function e(e){chrome.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES=1e4,chrome.webRequest.onBeforeRequest.addListener(function(e){if(!Fiddler.checkUrl(e.url))return{};var t=Fiddler_Rule.fireSome("onBeforeRequest",e);if(t)return t},{urls:["<all_urls>"]},["blocking","requestBody"]),chrome.webRequest.onBeforeSendHeaders.addListener(function(e){if(!Fiddler.checkUrl(e.url))return{};var t=Fiddler_Rule.fireMerge("onBeforeSendHeaders",e);if(t)return t.cancel?{cancel:!0}:{requestHeaders:t.requestHeaders}},{urls:["<all_urls>"]},["blocking","requestHeaders"]),chrome.webRequest.onCompleted.addListener(function(t){t.type=="main_frame"&&e&&e();if(!Fiddler.checkUrl(t.url))return{};Fiddler_Rule.fire("onCompleted",t)},{urls:["<all_urls>"]},["responseHeaders"])}return{init:e}}(),Fiddler_File=function(){"use strict";function e(e,t){return t=="script"&&(e=e.replace(/[\u0080-\uffff]/g,function(e){var t=e.charCodeAt(0).toString(16);return"\\u"+(new Array(5-t.length)).join("0")+t})),t!="main_frame"&&(e=encodeURIComponent(e)),e}function t(e){var t=e.lastIndexOf(".");return t==-1?"text/plain":MimeTea.cup(e.substring(++t))}return{getLocalFile:function(n,r,i){var s=new XMLHttpRequest;s.open("GET",n,!1),s.send(null);var o=s.responseText||s.responseXML;if(!o)return!1;var u=t(n);return r&&(o="data:"+u+"; "+r+","+e(o,i)),o},checkFileExist:function(e){return!!this.getLocalFile(e)},getRemoteFile:function(e){var t=Fiddler_Resource.getItem(e),n=t.url;n.indexOf("?")==-1?n+="?fiddler="+e:n+="&fiddler="+e;var r=t.method,i=when.defer();return $.ajax({url:n,method:r,complete:function(e){e=e.responseText||e.responseXML,i.resolve(e)}}),i.promise}}}(),Fiddler_Resource=function(){"use strict";var e={},t=Fiddler.implement({},Fiddler.CustEvent),n=0;return Fiddler.mix(t,{clearResource:function(){e={}},add:function(t,r){var i=t.requestId;t[r+"Time"]=t.timeStamp;if(i in e)for(var s in t)e[i][s]=t[s];else e[i]={},Fiddler.mix(e[i],t);if(r=="onCompleted"){var o=e[i].type,u=e[i].method;o=="main_frame"&&u=="GET"?(n=i,e[i].parentRequestId=0):e[i].parentRequestId=n,e[i].size=0;var a=e[i].responseHeaders||[];a.some(function(t){if(t.name=="Content-Length")return e[i].size=t.value,!0});var f=e[i].requestHeaders||[],l="";f.some(function(e){if(e.name=="Cookie")return l=e.value,!0});if(l){e[i].cookieSize=l.length;var c={};l=l.split(/;\s*/g),l.forEach(function(e){e=e.split("="),c[e[0]]=unescape(e[1])}),e[i].cookieLength=l.length,e[i].cookie=c}var h=Fiddler.getUrlDetail(t.url);Fiddler.mix(e[i],h,!0),this.fire("onCompleted",e[i])}},getItem:function(t){return e[t]||{}},getResoure:function(){return e},getContent:function(t){var n=when.defer(),r=e[t];return r.content?n.resolve(r.content):(Fiddler_File.getRemoteFile(t).then(function(r){e[t].content=r,n.resolve(r)}),n.promise)},setContent:function(t,n){if(!n)return!1;var r=0;for(var i in e)e[i].url===t&&(r=i);r&&(e[r].content=n,e[r].size=n.length)},getImgRect:function(e,t,n){n||(n=when.defer());var r=new Image,i=this;return r.onload=function(){n.resolve({width:this.width,height:this.height,old:e===t})},r.onerror=function(){if(e!=t)return i.getImgRect(t,t,n);n.resolve({width:this.width,height:this.height})},r.src=e,n.promise},getImgUrl:function(t){var n=e[t],r=n.content,i=Fiddler.getFileExt(n.url);if(i&&r){var s=r.substr(100),o=/^[\w\+\/\=]+$/;return o.test(s)||(r=Base64.encode(r)),"data:image/"+i+";base64,"+r}return n.url},getSize:function(t){var n=when.defer(),r=e[t];if(r.size)return n.resolve(r.size);if(r.content)return e[t].size=r.content.length,n.resolve(e[t].size);var i=this;return this.getContent(t).then(function(){return i.getSize(t)}).then(function(e){n.resolve(e)}),n.promise},getQueryData:function(e){var t=Fiddler.queryUrl(e)||{},n={data:null,length:0};for(var r in t)t[r]&&t[r].join&&(t[r]="["+t[r].join(", ")+"]"),n.length++;return n.length&&(n.data=t),n}}),t}(),Fiddler_Rule=function(){"use strict";var e=["onBeforeRequest","onBeforeSendHeaders","onSendHeaders","onHeadersReceived","onBeforeRedirect","onResponseStarted","onErrorOccurred","onCompleted"],t=Fiddler.implement({},Fiddler.CustEvent);e.forEach(function(e){t[e]=function(t){this.on(e,t)}});var n=!1,r=null;return Fiddler.mix(t,{match:function(e,t){return t.patternType=="Method"?this.matchMethod(e,t):t.patternType=="Header"?this.matchHeader(e,t):this.matchUrl(e,t)},matchUrl:function(e,t){var n=e.url,r=t.pattern;if(t.patternType=="String")return n.indexOf(r)>=0;r.indexOf("/")!=0&&(r="/"+r+"/");try{r.replace(/^\/(.*)\/([mig]*)$/g,function(e,t,n){r=new RegExp(t,n||"")});if(r.test(n))return!0}catch(i){}return!1},matchMethod:function(e,t){var n=e.method;return t.replace==e.url?!1:t.pattern.toLowerCase()==n.toLowerCase()},matchHeader:function(e,t){var n=(t.pattern||"").split("="),r=n.shift().toLowerCase(),i=n.join("="),s=e.requestHeaders||[];return s.some(function(e){var t=e.name.toLowerCase(),n=e.value;if(t==r){if(i==n)return!0;if(n.indexOf(i)==0)return!0}return!1})},addFileReplaceRule:function(e){var t=this;this.onBeforeRequest(function(n){var r=Fiddler_Config.getEncoding();if(t.match(n.data,e)){var i=e.replace,s=Fiddler_File.getLocalFile(i,r,n.data.type);return s===!1?(t.fire("fileError",i),!1):{redirectUrl:s}}return!1})},addDirReplaceRule:function(e){var t=this;this.onBeforeRequest(function(n){var r=n.data.url,i=Fiddler_Config.getEncoding(),s=r.indexOf(e.pattern);if(s===0){var o=r.substr(e.pattern.length),u=Fiddler.pathAdd(e.replace,o),a=Fiddler_File.getLocalFile(u,i,n.data.type);return a===!1?(t.fire("fileError",u),!1):{redirectUrl:a}}return!1})},addUrlReplaceRule:function(e){var t=this;this.onBeforeRequest(function(n){if(t.match(n.data,e)){var r=e.replace;return{redirectUrl:r}}return!1})},addDelayRule:function(e){var t=this;this.onBeforeSendHeaders(function(n){if(t.match(n.data,e)){var r=parseInt(e.replace,10)||0;return Fiddler.delay(r),!1}return!1})},addCancelRule:function(e){var t=this;this.onBeforeSendHeaders(function(n){return console.log(n.data),t.match(n.data,e)&&(n.data.cancel=!0),n.data})},addHeaderRule:function(e){var t=this;this.onBeforeSendHeaders(function(n){if(t.match(n.data,e)){var r=n.data.requestHeaders,i=t.headersToObj(r),s=t.parseHeader(e.replace);return i=Fiddler.mix(i,s,!0),r=t.headersToArr(i),n.data.requestHeaders=r,n.data}return!1})},parseHeader:function(e){e=(e||"").split(";");var t={};return e.forEach(function(e){e=e.trim();if(!e)return!1;e=e.split("=");var n=e[0].trim().toLowerCase();n=n.substr(0,1).toUpperCase()+n.substr(1),n=n.replace(/\-(\w)/ig,function(e,t){return"-"+t.toUpperCase()});var r=e[1].trim();if(!n)return!1;t[n]=r}),t},headersToObj:function(e){e=e||[];var t={};return e.forEach(function(e){t[e.name]=e.value}),t},headersToArr:function(e){var t=[];for(var n in e)t.push({name:n,value:e[n]});return t},resouceListening:function(t){if(n&&!t)return!1;n=!0;var r=this;e.forEach(function(e){r[e](function(t){var n=t.data;return Fiddler_Resource.add(n,e),!1})})},fileErrorListening:function(e){e&&(r=e),this.on("fileError",r)},disableCacheRule:function(){var e=this,t=["Cache-Control","Pragma","If-Modified-Since","If-None-Match"],n=["no-cache","no-cache","",""];this.onBeforeSendHeaders(function(r){var i=r.data.requestHeaders,s=e.headersToObj(i),o={};for(var u in s){if(t.indexOf(u)>-1)continue;o[u]=s[u]}return t.forEach(function(e,t){o[e]=n[t]}),i=e.headersToArr(o),r.data.requestHeaders=i,r.data})},userAgentRule:function(e){},parseRule:function(e){var t={File:"addFileReplaceRule",Path:"addDirReplaceRule",Cancel:"addCancelRule",Delay:"addDelayRule",Redirect:"addUrlReplaceRule",Header:"addHeaderRule"};return e.type=t[e.replaceType],e},addRule:function(e){var t=this.parseRule(e),n=t.type;this[n]&&(Fiddler_Config.addRule(t),e.enable&&this[n](t))},saveRules:function(e,t){var n=this;return this.clearAll(),this.resouceListening(!0),this.fileErrorListening(),t?(Fiddler_Config.clearRules(),e=e||[],e.forEach(function(e){n.addRule(e)}),this):this}}),t}()