
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
 
 jQuery Tools @VERSION / Expose - Dim the lights

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/toolbox/expose.html

 Since: Mar 2010
 Date: @DATE 
 
 jQuery Tools @VERSION Overlay - Overlay base. Extend it.

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/overlay/

 Since: March 2008
 Date: @DATE 
*/
(function(c){function m(){if(c.browser.msie){var f=c(document).height(),j=c(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,f-j<20?j:f]}return[c(document).width(),c(document).height()]}function g(f){if(f)return f.call(c.mask)}c.tools=c.tools||{version:"@VERSION"};var a;a=c.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:true,closeOnEsc:true,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var b,e,d,h,l;c.mask={load:function(f,j){if(d)return this;if(typeof f=="string")f={color:f};f=f||h;h=f=c.extend(c.extend({},a.conf),f);b=c("#"+f.maskId);if(!b.length){b=c("<div/>").attr("id",f.maskId);c("body").append(b)}var o=m();b.css({position:"absolute",top:0,left:0,width:o[0],height:o[1],display:"none",opacity:f.startOpacity,zIndex:f.zIndex});f.color&&b.css("backgroundColor",f.color);if(g(f.onBeforeLoad)===false)return this;f.closeOnEsc&&c(document).bind("keydown.mask",function(k){k.keyCode==
27&&c.mask.close(k)});f.closeOnClick&&b.bind("click.mask",function(k){c.mask.close(k)});c(window).bind("resize.mask",function(){c.mask.fit()});if(j&&j.length){l=j.eq(0).css("zIndex");c.each(j,function(){var k=c(this);/relative|absolute|fixed/i.test(k.css("position"))||k.css("position","relative")});e=j.css({zIndex:Math.max(f.zIndex+1,l=="auto"?0:l)})}b.css({display:"block"}).fadeTo(f.loadSpeed,f.opacity,function(){c.mask.fit();g(f.onLoad)});d=true;return this},close:function(){if(d){if(g(h.onBeforeClose)===
false)return this;b.fadeOut(h.closeSpeed,function(){g(h.onClose);e&&e.css({zIndex:l})});c(document).unbind("keydown.mask");b.unbind("click.mask");c(window).unbind("resize.mask");d=false}return this},fit:function(){if(d){var f=m();b.css({width:f[0],height:f[1]})}},getMask:function(){return b},isLoaded:function(){return d},getConf:function(){return h},getExposed:function(){return e}};c.fn.mask=function(f){c.mask.load(f);return this};c.fn.expose=function(f){c.mask.load(f,this);return this}})(jQuery);
(function(c){function m(b,e){var d=this,h=b.add(d),l=c(window),f,j,o,k=c.tools.expose&&(e.mask||e.expose),r=Math.random().toString().slice(10);if(k){if(typeof k=="string")k={color:k};k.closeOnClick=k.closeOnEsc=false}var s=e.target||b.attr("rel");j=s?c(s):b;if(!j.length)throw"Could not find Overlay: "+s;b&&b.index(j)==-1&&b.click(function(i){d.load(i);return i.preventDefault()});c.extend(d,{load:function(i){if(d.isOpened())return d;var n=a[e.effect];if(!n)throw'Overlay: cannot find effect : "'+e.effect+
'"';e.oneInstance&&c.each(g,function(){this.close(i)});i=i||c.Event();i.type="onBeforeLoad";h.trigger(i);if(i.isDefaultPrevented())return d;o=true;k&&c(j).expose(k);var p=e.top,t=e.left,u=j.outerWidth({margin:true}),v=j.outerHeight({margin:true});if(typeof p=="string")p=p=="center"?Math.max((l.height()-v)/2,0):parseInt(p,10)/100*l.height();if(t=="center")t=Math.max((l.width()-u)/2,0);n[0].call(d,{top:p,left:t},function(){if(o){i.type="onLoad";h.trigger(i)}});k&&e.closeOnClick&&c.mask.getMask().one("click",
d.close);e.closeOnClick&&c(document).bind("click."+r,function(q){c(q.target).parents(j).length||d.close(q)});e.closeOnEsc&&c(document).bind("keydown."+r,function(q){q.keyCode==27&&d.close(q)});return d},close:function(i){if(!d.isOpened())return d;i=i||c.Event();i.type="onBeforeClose";h.trigger(i);if(!i.isDefaultPrevented()){o=false;a[e.effect][1].call(d,function(){i.type="onClose";h.trigger(i)});c(document).unbind("click."+r).unbind("keydown."+r);k&&c.mask.close();return d}},getOverlay:function(){return j},
getTrigger:function(){return b},getClosers:function(){return f},isOpened:function(){return o},getConf:function(){return e}});c.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(i,n){c.isFunction(e[n])&&c(d).bind(n,e[n]);d[n]=function(p){c(d).bind(n,p);return d}});f=j.find(e.close||".close");if(!f.length&&!e.close){f=c('<a class="close"></a>');j.prepend(f)}f.click(function(i){d.close(i)});e.load&&d.load()}c.tools=c.tools||{version:"@VERSION"};c.tools.overlay={addEffect:function(b,
e,d){a[b]=[e,d]},conf:{close:null,closeOnClick:true,closeOnEsc:true,closeSpeed:"fast",effect:"default",fixed:!c.browser.msie||c.browser.version>6,left:"center",load:false,mask:null,oneInstance:true,speed:"normal",target:null,top:"10%"}};var g=[],a={};c.tools.overlay.addEffect("default",function(b,e){var d=this.getConf(),h=c(window);if(!d.fixed){b.top+=h.scrollTop();b.left+=h.scrollLeft()}b.position=d.fixed?"fixed":"absolute";this.getOverlay().css(b).fadeIn(d.speed,e)},function(b){this.getOverlay().fadeOut(this.getConf().closeSpeed,
b)});c.fn.overlay=function(b){var e=this.data("overlay");if(e)return e;if(c.isFunction(b))b={onBeforeLoad:b};b=c.extend(true,{},c.tools.overlay.conf,b);this.each(function(){e=new m(c(this),b);g.push(e);c(this).data("overlay",e)});return b.api?e:this}})(jQuery);
(function(c){c.fn.mqlkey=function(a){return this.each(function(){var b=c(this);if(b.is(":text")){var e=b.data("mqlkey");e&&e._destroy();e=new g(this,a);b.data("mqlkey",e)}})};var m=/^(\!)?(?:([a-z](?:_?[a-z0-9])*)\:)?(\/|\/?[a-z](?:_?[a-z0-9])*(?:\/[a-z](?:_?[a-z0-9])*)*)$/,g=c.mqlkey=function(a,b){this.options=c.extend(true,{},g.defaults,b);this.options.jsonp=g.use_jsonp(this.options.mqlread_url);this.input=c(a);this.original=this.input.val();this.init()};g.prototype={init:function(){var a=this;
this.input.bind("keyup.mqlkey",function(b){a.textchange(b)}).bind(c.browser.msie?"paste.mqlkey":"input.mqlkey",function(b){a.textchange(b)});if(this.options.source){this.source=c(this.options.source);this.source_generate=true;this.input.bind("change.mqlkey",function(){a.source_generate=false});this.source.bind("change.mqlkey",function(){if(a.source_generate){var b=g.from(a.source.val());a.input.val(b).trigger("keyup")}})}},_destroy:function(){this.input.unbind(".mqlkey");this.source&&this.source.unbind("change.mqlkey")},
textchange:function(a){clearTimeout(this.textchange_timeout);var b=this;this.textchange_timeout=setTimeout(function(){b.textchange_delay(a)},200)},textchange_delay:function(){this.input.trigger("textchange");var a=c.trim(this.input.val());return a===this.original&&a!==""?this.valid(a):g.reserved_word(a)?this.invalid(a,a+" is a reserved word."):m.test(a)?a.length<this.options.minlen?this.invalid(a):this.options.check_key?this.check_key(a):this.valid(a):this.invalid(a)},check_key:function(a){var b=
this;if(this.xhr){this.xhr.abort();this.xhr=null}var e={query:'{"query": {"id": null, "key": {"namespace": "'+this.options.namespace+'", "value": "'+a+'"}}}'};clearTimeout(this.check_key.timeout);var d={url:this.options.mqlread_url,data:e,success:function(h){if(h.code==="/api/status/ok")return h.result?b.invalid(a,"Key already exists"):b.valid(a)},error:function(h){if(h)return b.invalid(h.responseText())},dataType:b.options.jsonp?"jsonp":"json"};this.check_key.timeout=setTimeout(function(){b.ac_xhr=
c.ajax(d)},200)},valid:function(a){this.input.trigger("valid",a)},invalid:function(a,b){if(!b){b=this.options.minlen>1?"Key must be "+this.options.minlen+" or more alphanumeric characters":"Key must be alphanumeric";b+=", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively."}this.input.trigger("invalid",b)}};c.extend(g,{defaults:{minlen:1,check_key:true,namespace:"/",mqlread_url:"http://api.freebase.com/api/service/mqlread",source:null},
use_jsonp:function(a){if(!a)return false;var b=window.location.href;b=b.substr(0,b.length-window.location.pathname.length);if(b===a)return false;return true},from:function(a){a=a.toLowerCase();a=a.replace(/[^a-z0-9]/g,"_");a=a.replace(/\_\_+/g,"_");a=a.replace(/[^a-z0-9]+$/,"");a=a.replace(/^[^a-z]+/,"");if(g.reserved_word(a))a="x_"+a;return a},reservedwords:"meta typeguid left right datatype scope attribute relationship property link class future update insert delete replace create destroy default sort limit offset optional pagesize cursor index !index for while as in is if else return count function read write select var connect this self super xml sql mql any all macro estimate-count",
typeonlywords:"guid id object domain name key type keys value timestamp creator permission namespace unique schema reverse",_reserved_word:null,reserved_word:function(a){if(!g._reserved_word){g._reserved_word={};c.each([g.reservedwords,g.typeonlywords],function(b,e){c.each(e.split(" "),function(d,h){g._reserved_word[h]=1})})}return g._reserved_word[a]===1}})})(jQuery);
(function(c,m){c(window).ajaxSend(function(a,b,e){e.type==="POST"&&b.setRequestHeader("x-acre-cache-control","max-age: 3600")});var g=m.schema.edit={init_edit_form:function(a){if(a.mode==="add")c("tbody",a.table).append(a.row);else if(a.mode==="edit")a.trigger_row.before(a.row);else throw"Unknown edit type mode: "+a.mode;a.trigger_row.before(a.submit_row);var b=a.event_prefix||"fb.schema.edit.";a.row.bind(b+"submit",function(){g.submit_edit_form(a)}).bind(b+"cancel",function(){g.cancel_edit_form(a)}).bind(b+
"error",function(e,d,h){g.row_error(d,h);a.row.removeClass("loading")}).bind(b+"success",function(){a.row.removeClass("loading")});c(".button-submit",a.submit_row).click(function(){a.row.trigger(b+"submit")});c(".button-cancel",a.submit_row).click(function(){a.row.trigger(b+"cancel")});a.row.showRow(function(){typeof a.init_form==="function"&&a.init_form(a)});a.trigger_row.hide();a.submit_row.show();c("[placeholder]",a.row).placeholder();c(window).bind("fb.lang.select",function(e,d){g.toggle_lang(a.row,
d)})},cancel_edit_form:function(a){a.row.hideRow(function(){c(this).remove()});g.clear_row_message(a.row);a.submit_row.remove();a.trigger_row.show();a.trigger.removeClass("editing")},submit_edit_form:function(a){if(!a.row.is(".loading")){document.activeElement&&c(document.activeElement).blur();g.clear_row_message(a.row);typeof a.validate_form==="function"&&a.validate_form(a);if(!g.has_row_message(a.row,"error")){a.row.addClass("loading");typeof a.submit_form==="function"&&a.submit_form(a)}}},ajax_error_handler:function(a,
b,e){var d;try{d=JSON.parse(a.responseText);if(d.messages&&d.messages.length)d=JSON.stringify(d.messages[0])}catch(h){}if(!d)d=a.responseText;if(b){g.row_error(b,d);b.removeClass("loading")}else if(e){g.form_error(e,d);e.removeClass("loading")}},row_error:function(a,b){return g.row_message(a,b,"error")},row_message:function(a,b,e){var d=c('<a class="close-msg" href="#">Close</a>').click(function(h){return m.schema.close_message.apply(this,[h,".row-msg:first"])});b=c("<span>").text(b);d=c('<td colspan="5">').append(d).append(b);
d=c('<tr class="row-msg">').append(d);e&&d.addClass("row-msg-"+e);a.before(d);d.hide().showRow();b=a.data("row-msg");if(!b){b={};a.data("row-msg",b)}if(b[e])b[e].push(d);else b[e]=[d];return d},clear_row_message:function(a){var b=a.data("row-msg");if(b){c.each(b,function(e,d){c.each(d,function(h,l){l.remove()})});a.removeData("row-msg")}},has_row_message:function(a,b){var e=a.data("row-msg");if(b)return e&&e[b]&&e[b].length;return e!=null},init_modal_form:function(a){c(document.body).append(a.form.hide());
var b=a.event_prefix||"fb.schema.edit.modal.";a.form.bind(b+"submit",function(){g.submit_modal_form(a)}).bind(b+"error",function(e,d){g.form_error(a.form,d)}).bind(b+"success",function(){a.form.removeClass("loading")});c(".modal-buttons .button-submit",a.form).click(function(){a.form.trigger(b+"submit")});a.form.overlay({close:".modal-buttons .button-cancel",closeOnClick:false,load:true,mask:{color:"#000",loadSpeed:200,opacity:0.5},onLoad:function(){typeof a.init_form==="function"&&a.init_form(a)}});
c("[placeholder]",a.form).placeholder();m.schema.init_modal_help(a.form);c(window).bind("fb.lang.select",function(e,d){g.toggle_lang(a.form,d)})},submit_modal_form:function(a){if(!a.form.is(".loading")){document.activeElement&&c(document.activeElement).blur();g.clear_form_message(a.form);typeof a.validate_form==="function"&&a.validate_form(a);if(!g.has_form_message(a.form,"error")){a.form.addClass("loading");typeof a.submit_form==="function"&&a.submit_form(a)}}},form_error:function(a,b){return g.form_message(a,
b,"error")},form_message:function(a,b,e){b=c("<div class='form-msg'>").text(b).hide();c(".form-group",a).prepend(b);b.slideDown();var d=a.data("form-msg");if(!d){d={};a.data("form-msg",d)}if(d[e])d[e].push(b);else d[e]=[b];return b},clear_form_message:function(a){var b=a.data("form-msg");if(b){c.each(b,function(e,d){c.each(d,function(h,l){l.remove()})});a.removeData("form-msg")}},has_form_message:function(a,b){var e=a.data("form-msg");if(b)return e&&e[b]&&e[b].length;return e!=null},toggle_lang:function(a,
b){c("[lang]",a).each(function(){var e=c(this);c(this).attr("lang")===b?e.show().focus().blur():e.hide()})},init_mqlkey:function(a,b){a.mqlkey(b).bind("valid",function(){c(this).next(".key-status").removeClass("invalid").removeClass("loading").addClass("valid").text("valid").attr("title","Key is available")}).bind("invalid",function(e,d){c(this).next(".key-status").removeClass("valid").removeClass("loading").addClass("invalid").text("invalid").attr("title",d)}).bind("textchange",function(){c(this).next(".key-status").removeClass("invalid").removeClass("valid").addClass("loading")})},
validate_mqlkey:function(a,b){var e=a.form||a.row,d=b.next(".key-status"),h=b.val();if(h===""){e.trigger(a.event_prefix+"error","Key is required");return false}if(h===b.data("mqlkey").original)return true;if(d.is(".invalid")){e.trigger(a.event_prefix+"error",d.attr("title"));return false}else if(d.is(".loading"))return false;return true}}})(jQuery,window.freebase);
