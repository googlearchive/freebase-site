
/*
 * Copyright 2012, Google Inc.
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
(function(c){function h(){if(c.browser.msie){var g=c(document).height(),k=c(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,g-k<20?k:g]}return[c(document).width(),c(document).height()]}function d(g){if(g)return g.call(c.mask)}c.tools=c.tools||{version:"@VERSION"};var a;a=c.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:true,closeOnEsc:true,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var b,f,e,i,m;c.mask={load:function(g,k){if(e)return this;if(typeof g=="string")g={color:g};g=g||i;i=g=c.extend(c.extend({},a.conf),g);b=c("#"+g.maskId);if(!b.length){b=c("<div/>").attr("id",g.maskId);c("body").append(b)}var o=h();b.css({position:"absolute",top:0,left:0,width:o[0],height:o[1],display:"none",opacity:g.startOpacity,zIndex:g.zIndex});g.color&&b.css("backgroundColor",g.color);if(d(g.onBeforeLoad)===false)return this;g.closeOnEsc&&c(document).bind("keydown.mask",function(l){l.keyCode==
27&&c.mask.close(l)});g.closeOnClick&&b.bind("click.mask",function(l){c.mask.close(l)});c(window).bind("resize.mask",function(){c.mask.fit()});if(k&&k.length){m=k.eq(0).css("zIndex");c.each(k,function(){var l=c(this);/relative|absolute|fixed/i.test(l.css("position"))||l.css("position","relative")});f=k.css({zIndex:Math.max(g.zIndex+1,m=="auto"?0:m)})}b.css({display:"block"}).fadeTo(g.loadSpeed,g.opacity,function(){c.mask.fit();d(g.onLoad)});e=true;return this},close:function(){if(e){if(d(i.onBeforeClose)===
false)return this;b.fadeOut(i.closeSpeed,function(){d(i.onClose);f&&f.css({zIndex:m})});c(document).unbind("keydown.mask");b.unbind("click.mask");c(window).unbind("resize.mask");e=false}return this},fit:function(){if(e){var g=h();b.css({width:g[0],height:g[1]})}},getMask:function(){return b},isLoaded:function(){return e},getConf:function(){return i},getExposed:function(){return f}};c.fn.mask=function(g){c.mask.load(g);return this};c.fn.expose=function(g){c.mask.load(g,this);return this}})(jQuery);
(function(c){function h(b,f){var e=this,i=b.add(e),m=c(window),g,k,o,l=c.tools.expose&&(f.mask||f.expose),r=Math.random().toString().slice(10);if(l){if(typeof l=="string")l={color:l};l.closeOnClick=l.closeOnEsc=false}var s=f.target||b.attr("rel");k=s?c(s):b;if(!k.length)throw"Could not find Overlay: "+s;b&&b.index(k)==-1&&b.click(function(j){e.load(j);return j.preventDefault()});c.extend(e,{load:function(j){if(e.isOpened())return e;var n=a[f.effect];if(!n)throw'Overlay: cannot find effect : "'+f.effect+
'"';f.oneInstance&&c.each(d,function(){this.close(j)});j=j||c.Event();j.type="onBeforeLoad";i.trigger(j);if(j.isDefaultPrevented())return e;o=true;l&&c(k).expose(l);var p=f.top,t=f.left,u=k.outerWidth({margin:true}),v=k.outerHeight({margin:true});if(typeof p=="string")p=p=="center"?Math.max((m.height()-v)/2,0):parseInt(p,10)/100*m.height();if(t=="center")t=Math.max((m.width()-u)/2,0);n[0].call(e,{top:p,left:t},function(){if(o){j.type="onLoad";i.trigger(j)}});l&&f.closeOnClick&&c.mask.getMask().one("click",
e.close);f.closeOnClick&&c(document).bind("click."+r,function(q){c(q.target).parents(k).length||e.close(q)});f.closeOnEsc&&c(document).bind("keydown."+r,function(q){q.keyCode==27&&e.close(q)});return e},close:function(j){if(!e.isOpened())return e;j=j||c.Event();j.type="onBeforeClose";i.trigger(j);if(!j.isDefaultPrevented()){o=false;a[f.effect][1].call(e,function(){j.type="onClose";i.trigger(j)});c(document).unbind("click."+r).unbind("keydown."+r);l&&c.mask.close();return e}},getOverlay:function(){return k},
getTrigger:function(){return b},getClosers:function(){return g},isOpened:function(){return o},getConf:function(){return f}});c.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(j,n){c.isFunction(f[n])&&c(e).bind(n,f[n]);e[n]=function(p){c(e).bind(n,p);return e}});g=k.find(f.close||".close");if(!g.length&&!f.close){g=c('<a class="close"></a>');k.prepend(g)}g.click(function(j){e.close(j)});f.load&&e.load()}c.tools=c.tools||{version:"@VERSION"};c.tools.overlay={addEffect:function(b,
f,e){a[b]=[f,e]},conf:{close:null,closeOnClick:true,closeOnEsc:true,closeSpeed:"fast",effect:"default",fixed:!c.browser.msie||c.browser.version>6,left:"center",load:false,mask:null,oneInstance:true,speed:"normal",target:null,top:"10%"}};var d=[],a={};c.tools.overlay.addEffect("default",function(b,f){var e=this.getConf(),i=c(window);if(!e.fixed){b.top+=i.scrollTop();b.left+=i.scrollLeft()}b.position=e.fixed?"fixed":"absolute";this.getOverlay().css(b).fadeIn(e.speed,f)},function(b){this.getOverlay().fadeOut(this.getConf().closeSpeed,
b)});c.fn.overlay=function(b){var f=this.data("overlay");if(f)return f;if(c.isFunction(b))b={onBeforeLoad:b};b=c.extend(true,{},c.tools.overlay.conf,b);this.each(function(){f=new h(c(this),b);d.push(f);c(this).data("overlay",f)});return b.api?f:this}})(jQuery);
(function(c){c.fn.mqlkey=function(d){return this.each(function(){var a=c(this);if(a.is(":text")){var b=a.data("mqlkey");b&&b._destroy();b=new h(this,d);a.data("mqlkey",b)}})};var h=c.mqlkey=function(d,a){this.options=c.extend(true,{},h.defaults,a);this.input=c(d);this.original=this.input.val();this.init()};h.prototype={init:function(){var d=this;this.input.bind("keyup.mqlkey",function(a){d.textchange(a)}).bind(c.browser.msie?"paste.mqlkey":"input.mqlkey",function(a){d.textchange(a)});if(this.options.source){this.source=
c(this.options.source);this.source_generate=this.source.val()===""?true:false;this.input.bind("change.mqlkey",function(){d.source_generate=false});this.source.bind("change.mqlkey",function(){if(d.source_generate){var a=h.from(d.source.val());d.input.val(a).trigger("keyup")}})}},_destroy:function(){this.input.unbind(".mqlkey");this.source&&this.source.unbind("change.mqlkey")},textchange:function(d){clearTimeout(this.textchange_timeout);var a=this;this.textchange_timeout=setTimeout(function(){a.textchange_delay(d)},
200)},textchange_delay:function(){this.input.trigger("textchange");var d=c.trim(this.input.val());return d===this.original&&d!==""?this.valid(d):h.reserved_word(d)?this.invalid(d,d+" is a reserved word."):h.test(d,this.options.schema)?d.length<this.options.minlen?this.invalid(d):this.options.check_key?this.check_key(d):this.valid(d):this.invalid(d)},check_key:function(d){var a=this;if(this.xhr)this.xhr=null;var b={id:null,key:{namespace:this.options.namespace,value:d}};clearTimeout(this.check_key.timeout);
this.check_key.timeout=setTimeout(function(){a.xhr=a.options.mqlread(b,function(f){return f?a.invalid(d,"Key already exists"):a.valid(d)},function(f){return f?a.invalid(f.responseText()):a.invalid("mqlread error!")})},200)},valid:function(d){this.input.trigger("valid",d)},invalid:function(d,a){if(!a){a=this.options.minlen>1?"Key must be "+this.options.minlen+" or more alphanumeric characters":"Key must be alphanumeric";a+=", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively."}this.input.trigger("invalid",
a)}};c.extend(h,{defaults:{minlen:1,check_key:true,namespace:"/",mqlread:function(d,a,b){return h.mqlread(null,d,a,b)},source:null,schema:false},mqlread:function(d,a,b,f){d={url:d||"http://api.freebase.com/api/service/mqlread",data:{query:JSON.stringify({query:a})},dataType:"jsonp",success:function(e){return b(e.result)},error:f};return c.ajax(d)},from:function(d){d=d.toLowerCase();d=d.replace(/[^a-z0-9]/g,"_");d=d.replace(/\_\_+/g,"_");d=d.replace(/[^a-z0-9]+$/,"");d=d.replace(/^[^a-z]+/,"");if(h.reserved_word(d))d=
"x_"+d;return d},reservedwords:"meta typeguid left right datatype scope attribute relationship property link class future update insert delete replace create destroy default sort limit offset optional pagesize cursor index !index for while as in is if else return count function read write select var connect this self super xml sql mql any all macro estimate-count",typeonlywords:"guid id object domain name key type keys value timestamp creator permission namespace unique schema reverse",_reserved_word:null,
reserved_word:function(d){if(!h._reserved_word){h._reserved_word={};c.each([h.reservedwords,h.typeonlywords],function(a,b){c.each(b.split(" "),function(f,e){h._reserved_word[e]=1})})}return h._reserved_word[d]===1},fast:/^[A-Za-z0-9](?:[_-]?[A-Za-z0-9])*$/,slow:/^(?:[A-Za-z0-9]|\$[A-F0-9]{4})(?:[_-]?[A-Za-z0-9]|[_-]?\$[A-F0-9]{4})*$/,schema:/^[a-z](?:_?[a-z0-9])*$/,test:function(d,a){if(a)return h.schema.test(d);return h.fast.test(d)||h.slow.test(d)}})})(jQuery);
(function(c,h){c(window).ajaxSend(function(a,b,f){f.type==="POST"&&b.setRequestHeader("x-acre-cache-control","max-age: 3600")});var d=h.schema.edit={init_edit_form:function(a){if(a.mode==="add")c("tbody",a.table).append(a.row);else if(a.mode==="edit")a.trigger_row.before(a.row);else throw"Unknown edit type mode: "+a.mode;a.trigger_row.before(a.submit_row);var b=a.event_prefix||"fb.schema.edit.";a.row.bind(b+"submit",function(){d.submit_edit_form(a)}).bind(b+"cancel",function(){d.cancel_edit_form(a)}).bind(b+
"error",function(f,e,i){d.row_error(e,i);a.row.removeClass("loading")}).bind(b+"success",function(){a.row.removeClass("loading")});c("button.save",a.submit_row).click(function(){a.row.trigger(b+"submit")});c(".button.cancel",a.submit_row).click(function(){a.row.trigger(b+"cancel")});a.row.showRow(function(){typeof a.init_form==="function"&&a.init_form(a)});a.trigger_row.hide();a.submit_row.show()},cancel_edit_form:function(a){a.row.hideRow(function(){c(this).remove()});d.clear_row_message(a.row);
a.submit_row.remove();a.trigger_row.show();a.trigger.removeClass("editing")},submit_edit_form:function(a){if(!a.row.is(".loading")){document.activeElement&&c(document.activeElement).blur();d.clear_row_message(a.row);typeof a.validate_form==="function"&&a.validate_form(a);if(!d.has_row_message(a.row,"error")){a.row.addClass("loading");typeof a.submit_form==="function"&&a.submit_form(a)}}},ajax_error_handler:function(a,b,f){var e;try{e=JSON.parse(a.responseText);if(e.messages&&e.messages.length)e=JSON.stringify(e.messages[0])}catch(i){}if(!e)e=
a.responseText;if(b){d.row_error(b,e);b.removeClass("loading")}else if(f){d.form_error(f,e);f.removeClass("loading")}},row_error:function(a,b){return d.row_message(a,b,"error")},row_message:function(a,b,f){var e=c('<a class="close-msg" href="#">Close</a>').click(function(i){return h.schema.close_message.apply(this,[i,".row-msg:first"])});b=c("<span>").text(b);e=c('<td colspan="5">').append(e).append(b);e=c('<tr class="row-msg">').append(e);f&&e.addClass("row-msg-"+f);a.before(e);e.hide().showRow();
b=a.data("row-msg");if(!b){b={};a.data("row-msg",b)}if(b[f])b[f].push(e);else b[f]=[e];return e},clear_row_message:function(a){var b=a.data("row-msg");if(b){c.each(b,function(f,e){c.each(e,function(i,m){m.remove()})});a.removeData("row-msg")}},has_row_message:function(a,b){var f=a.data("row-msg");if(b)return f&&f[b]&&f[b].length;return f!=null},init_modal_form:function(a){c(document.body).append(a.form.hide());var b=a.event_prefix||"fb.schema.edit.modal.";a.form.bind(b+"submit",function(){d.submit_modal_form(a)}).bind(b+
"error",function(f,e){d.form_error(a.form,e)}).bind(b+"success",function(){a.form.removeClass("loading")});c(".modal-buttons .button.save",a.form).click(function(){a.form.trigger(b+"submit")});a.form.overlay({close:".modal-buttons .button.cancel",closeOnClick:false,load:true,fixed:false,mask:{color:"#000",loadSpeed:200,opacity:0.5},onLoad:function(){typeof a.init_form==="function"&&a.init_form(a)}});h.schema.init_modal_help(a.form)},submit_modal_form:function(a){if(!a.form.is(".loading")){document.activeElement&&
c(document.activeElement).blur();d.clear_form_message(a.form);typeof a.validate_form==="function"&&a.validate_form(a);if(!d.has_form_message(a.form,"error")){a.form.addClass("loading");typeof a.submit_form==="function"&&a.submit_form(a)}}},form_error:function(a,b){return d.form_message(a,b,"error")},form_message:function(a,b,f){b=c("<div class='form-msg'>").text(b).hide();c(".form-group",a).prepend(b);b.slideDown();var e=a.data("form-msg");if(!e){e={};a.data("form-msg",e)}if(e[f])e[f].push(b);else e[f]=
[b];return b},clear_form_message:function(a){var b=a.data("form-msg");if(b){c.each(b,function(f,e){c.each(e,function(i,m){m.remove()})});a.removeData("form-msg")}},has_form_message:function(a,b){var f=a.data("form-msg");if(b)return f&&f[b]&&f[b].length;return f!=null},init_mqlkey:function(a,b){a.mqlkey(b).bind("valid",function(){c(this).next(".key-status").removeClass("invalid").removeClass("loading").addClass("valid").text("valid").attr("title","Key is available")}).bind("invalid",function(f,e){c(this).next(".key-status").removeClass("valid").removeClass("loading").addClass("invalid").text("invalid").attr("title",
e)}).bind("textchange",function(){c(this).next(".key-status").removeClass("invalid").removeClass("valid").addClass("loading")})},validate_mqlkey:function(a,b){var f=a.form||a.row,e=b.next(".key-status"),i=b.val();if(i===""){f.trigger(a.event_prefix+"error","Key is required");return false}if(i===b.data("mqlkey").original)return true;if(e.is(".invalid")){f.trigger(a.event_prefix+"error",e.attr("title"));return false}else if(e.is(".loading"))return false;return true}}})(jQuery,window.freebase);
