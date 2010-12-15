
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Additional Licenses for Third Party components can be found here:
 * http://wiki.freebase.com/wiki/Freebase_Site_License
 *
 */
/*

 Cookie plugin

 Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 Dual licensed under the MIT and GPL licenses:
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html

*/
if(!("JSON"in window&&window.JSON)){if(!this.JSON)this.JSON={};(function(){function a(g){return g<10?"0"+g:g}function b(g){f.lastIndex=0;return f.test(g)?'"'+g.replace(f,function(j){var l=c[j];return typeof l==="string"?l:"\\u"+("0000"+j.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+g+'"'}function d(g,j){var l,m,p,r,q=i,o,k=j[g];if(k&&typeof k==="object"&&typeof k.toJSON==="function")k=k.toJSON(g);if(typeof h==="function")k=h.call(j,g,k);switch(typeof k){case "string":return b(k);case "number":return isFinite(k)?
String(k):"null";case "boolean":case "null":return String(k);case "object":if(!k)return"null";i+=n;o=[];if(Object.prototype.toString.apply(k)==="[object Array]"){r=k.length;for(l=0;l<r;l+=1)o[l]=d(l,k)||"null";p=o.length===0?"[]":i?"[\n"+i+o.join(",\n"+i)+"\n"+q+"]":"["+o.join(",")+"]";i=q;return p}if(h&&typeof h==="object"){r=h.length;for(l=0;l<r;l+=1){m=h[l];if(typeof m==="string")if(p=d(m,k))o.push(b(m)+(i?": ":":")+p)}}else for(m in k)if(Object.hasOwnProperty.call(k,m))if(p=d(m,k))o.push(b(m)+
(i?": ":":")+p);p=o.length===0?"{}":i?"{\n"+i+o.join(",\n"+i)+"\n"+q+"}":"{"+o.join(",")+"}";i=q;return p}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+a(this.getUTCMonth()+1)+"-"+a(this.getUTCDate())+"T"+a(this.getUTCHours())+":"+a(this.getUTCMinutes())+":"+a(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var e=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
f=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,n,c={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},h;if(typeof JSON.stringify!=="function")JSON.stringify=function(g,j,l){var m;n=i="";if(typeof l==="number")for(m=0;m<l;m+=1)n+=" ";else if(typeof l==="string")n=l;if((h=j)&&typeof j!=="function"&&(typeof j!=="object"||typeof j.length!=="number"))throw new Error("JSON.stringify");return d("",
{"":g})};if(typeof JSON.parse!=="function")JSON.parse=function(g,j){function l(p,r){var q,o,k=p[r];if(k&&typeof k==="object")for(q in k)if(Object.hasOwnProperty.call(k,q)){o=l(k,q);if(o!==undefined)k[q]=o;else delete k[q]}return j.call(p,r,k)}var m;g=String(g);e.lastIndex=0;if(e.test(g))g=g.replace(e,function(p){return"\\u"+("0000"+p.charCodeAt(0).toString(16)).slice(-4)});if(/^[\],:{}\s]*$/.test(g.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){m=eval("("+g+")");return typeof j==="function"?l({"":m},""):m}throw new SyntaxError("JSON.parse");}})()}
jQuery.cookie=function(a,b,d){if(typeof b!="undefined"){d=d||{};if(b===null){b="";d=$.extend({},d);d.expires=-1}var e="";if(d.expires&&(typeof d.expires=="number"||d.expires.toUTCString)){if(typeof d.expires=="number"){e=new Date;e.setTime(e.getTime()+d.expires*24*60*60*1E3)}else e=d.expires;e="; expires="+e.toUTCString()}var f=d.path?"; path="+d.path:"",i=d.domain?"; domain="+d.domain:"";d=d.secure?"; secure":"";document.cookie=[a,"=",encodeURIComponent(b),e,f,i,d].join("")}else{b=null;if(document.cookie&&
document.cookie!=""){d=document.cookie.split(";");for(e=0;e<d.length;e++){f=jQuery.trim(d[e]);if(f.substring(0,a.length+1)==a+"="){b=decodeURIComponent(f.substring(a.length+1));break}}}return b}};
(function(a){a.extend({localstore:function(b,d,e){var f=document.location.hostname,i=document.location.protocol;if(typeof d!="undefined"){var n=JSON.stringify(d);if(!e&&window.globalStorage)window.globalStorage[f][i+b]=n;else if(d===null){var c={};c.domain=COOKIE_DOMAIN?COOKIE_DOMAIN:fb.get_cookie_domain();a.cookie(b,null,c)}else a.cookie(b,n,a.extend(c,{expires:14,path:"/"}));return d}else{if(!e&&window.globalStorage){if(window.globalStorage[f][i+b])d=window.globalStorage[f][i+b].value}else d=a.cookie(b);
if(d!=null)return JSON.parse(d,null)}return null}})})(jQuery);
(function(a){function b(e,f){this.options=a.extend(true,{},f);this.input=a(e);this.placeholder=this.input.attr("placeholder")||"";this.init()}if("placeholder"in document.createElement("input"))a.fn.placeholder=function(){return this};else{var d=a.fn.val;a.fn.val=function(e){if(e===undefined)if(this.hasClass("placeholder"))return"";return d.apply(this,[e])};b.prototype={init:function(){var e=this,f=this.input.val();if(f===""||f===this.placeholder)this.input.val(this.placeholder).addClass("placeholder");this.input.bind("focus.placeholder",
function(i){return e.focus(i)}).bind("blur.placeholder",function(i){return e.blur(i)});this.input[0].form&&a(this.input[0].form).bind("submit",function(i){return e.submit(i)})},destroy:function(){this.input.unbind(".placeholder");this.input[0].form&&a(this.input[0].form).unbind(".placeholder")},focus:function(){this.input.hasClass("placeholder")&&this.input.val("").removeClass("placeholder")},blur:function(){this.input.val()===""&&this.input.val(this.input.attr("placeholder")).addClass("placeholder")},
submit:function(){this.input.hasClass("placeholder")&&this.input.val("")}};a.fn.placeholder=function(e){return this.each(function(){var f=a(this);f.unbind(".placeholder");if(f.is(":text")||f.is("textarea"))if(f.attr("placeholder")){(f=a.data(this,"placeholder"))&&f.destroy();a.data(this,"placeholder",new b(this,e))}})}}})(jQuery);
(function(a){a.extend({metadata:{defaults:{type:"class",name:"metadata",cre:/({.*})/,single:"metadata"},setType:function(b,d){this.defaults.type=b;this.defaults.name=d},get:function(b,d){var e=a.extend({},this.defaults,d);if(!e.single.length)e.single="metadata";var f=a.data(b,e.single);if(f)return f;f="{}";var i=function(h){if(typeof h!="string")return h;return h=eval("("+h+")")};if(e.type=="html5"){var n={};a(b.attributes).each(function(){var h=this.nodeName;if(h.match(/^data-/))h=h.replace(/^data-/,
"");else return true;n[h]=i(this.nodeValue)})}else{if(e.type=="class"){var c=e.cre.exec(b.className);if(c)f=c[1]}else if(e.type=="elem"){if(!b.getElementsByTagName)return;c=b.getElementsByTagName(e.name);if(c.length)f=a.trim(c[0].innerHTML)}else if(b.getAttribute!=undefined)if(c=b.getAttribute(e.name))f=c;n=i(f.indexOf("{")<0?"{"+f+"}":f)}a.data(b,e.single,n);return n}}});a.fn.metadata=function(b){return a.metadata.get(this[0],b)}})(jQuery);window.freebase=window.fb={mwLWTReloading:false};
if(typeof window.SERVER==="object"&&window.SERVER.acre)window.fb.acre=window.SERVER.acre;
(function(a,b){if(a.cookie("mwLWTReloaded"))a.cookie("mwLWTReloaded",null,{path:"/"});else{var d=0,e=0;if(typeof b.acre==="object"&&b.acre&&b.acre.mwLastWriteTime)e=b.acre.mwLastWriteTime||0;if(document.cookie&&document.cookie!="")for(var f=document.cookie.split(";"),i=0,n=f.length;i<n;i++){var c=a.trim(f[i]);if(c.indexOf("mwLastWriteTime=")===0){c=decodeURIComponent(c.substring(16)).split("|");if(c.length)d=c[0]}}f=d?parseInt(d,10):-1;i=e?parseInt(e,10):-1;if(d&&e&&i<f){a.cookie("mwLWTReloaded",
"true",{path:"/"});b.mwLWTReloading=true;window.location.reload(true)}}})(jQuery,window.freebase);
(function(a,b){if(!b.mwLWTReloading){if(!window.console)window.console={log:a.noop,info:a.noop,debug:a.noop,warn:a.noop,error:a.noop};b.dispatch=function(c,h,g,j){if(typeof h!=="function")return false;c=a.event.fix(c||window.event);g||(g=[]);j||(j=this);return h.apply(j,[c].concat(g))};b.get_script=function(c,h){var g=b.get_script.cache,j=g[c];if(j)if(j.state===1)j.callbacks.push(h);else j.state===4&&h();else{j=g[c]={state:0,callbacks:[h]};a.ajax({url:c,dataType:"script",beforeSend:function(){j.state=
1},success:function(){j.state=4;a.each(j.callbacks,function(l,m){m()})},error:function(){j.state=-1}})}};b.get_script.cache={};a(window).bind("fb.user.signedin",function(c,h){console.log("fb.user.signnedin");b.user=h;var g=a("#nav-username a:first");if(g.length){g[0].href+=b.user.id;g.text(b.user.name)}a("#signedin").show()}).bind("fb.user.signedout",function(){console.log("fb.user.signedout");a("#signedout").show()});if(/\.(freebase|sandbox\-freebase)\.com$/.test(b.acre.request.server_name)){var d=
function(c,h){var g=c.indexOf("|"+h+"_");if(g!=-1){g=g+2+h.length;var j=c.indexOf("|",g);if(j!=-1)return decodeURIComponent(c.substr(g,j-g))}return null},e=a.cookie("metaweb-user-info");if(e){var f=d(e,"g"),i=d(e,"u"),n=d(e,"p");n||(n="/user/"+this.name);setTimeout(function(){a(window).trigger("fb.user.signedin",{guid:f,name:i,id:n})},0)}else setTimeout(function(){a(window).trigger("fb.user.signedout")},0)}else a.ajax({url:"/acre/account/user_info",dataType:"json",success:function(c){c&&c.code===
"/api/status/ok"?a(window).trigger("fb.user.signedin",{id:c.id,guid:c.guid,name:c.username}):a(window).trigger("fb.user.signedout")},error:function(){a(window).trigger("fb.user.signedout")}});a(function(){var c=a("#SearchBox .SearchBox-input,#global-search-input"),h=b.acre.freebase.site_host;c.suggest({service_url:h,soft:true,category:"object",parent:"#site-search-box",align:"right",advanced:true,codemirror:{path:"http://freebaselibs.com/static/freebase_site/codemirror/a9a6a3d5a293b55143be441e4196871f/",
codemirrorjs:"codemirror.mf.js",basefiles:[],parserfile:["codemirror-frame.mf.js"],stylesheet:["http://freebaselibs.com/static/freebase_site/codemirror/a9a6a3d5a293b55143be441e4196871f/codemirror-frame.mf.css"]}});a("#site-search-label");a("#site-search-box .fbs-pane");c.bind("fb-select",function(g,j){window.location=h+"/view"+j.id;return false});a(".SearchBox-form").submit(function(){return a.trim(a("#global-search-input").val()).length==0?false:true});a("input, textarea").placeholder()});b.disable=
function(c){a(c).attr("disabled","disabled").addClass("disabled")};b.enable=function(c){a(c).removeAttr("disabled").removeClass("disabled")};b.lang_select=function(c,h){setTimeout(function(){a(window).trigger("fb.lang.select",h)},0)};b.devbar={div:a("#devbar"),touch:function(){/\.(freebase|sandbox\-freebase)\.com$/.test(b.acre.request.server_name)?a.ajax({url:b.acre.freebase.service_url+"/api/service/touch",dataType:"jsonp"}):a.ajax({url:"/acre/touch"});return false},txn_ids:[],txn:function(){return b.devbar.view_txn(this.href,
b.devbar.txn_ids)},view_txn:function(c,h){if(h&&h.length)window.location=c+"?"+a.param({tid:h},true);return false},ajaxComplete:function(c){if(c&&c.readyState===4)(c=c.getResponseHeader("x-metaweb-tid"))&&b.devbar.txn_ids.push(c)},init:function(){a("#devbar-touch > a").click(b.devbar.touch);b.acre.tid&&b.devbar.txn_ids.push(b.acre.tid);a("#devbar-txn > a").click(b.devbar.txn);a.ajaxSetup({complete:b.devbar.ajaxComplete})}};b.devbar.init()}})(jQuery,window.freebase);
