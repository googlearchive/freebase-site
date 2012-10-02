
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
(function(b){function g(){if(b.browser.msie){var a=b(document).height(),c=b(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,20>a-c?c:a]}return[b(document).width(),b(document).height()]}function f(a){if(a)return a.call(b.mask)}b.tools=b.tools||{version:"@VERSION"};var a;a=b.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:!0,closeOnEsc:!0,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var c,e,d,n,k;b.mask={load:function(h,i){if(d)return this;"string"==typeof h&&(h={color:h});h=h||n;n=h=b.extend(b.extend({},a.conf),h);c=b("#"+h.maskId);c.length||(c=b("<div/>").attr("id",h.maskId),b("body").append(c));var l=g();c.css({position:"absolute",top:0,left:0,width:l[0],height:l[1],display:"none",opacity:h.startOpacity,zIndex:h.zIndex});h.color&&c.css("backgroundColor",h.color);if(!1===f(h.onBeforeLoad))return this;h.closeOnEsc&&b(document).bind("keydown.mask",function(a){a.keyCode==
27&&b.mask.close(a)});h.closeOnClick&&c.bind("click.mask",function(a){b.mask.close(a)});b(window).bind("resize.mask",function(){b.mask.fit()});i&&i.length&&(k=i.eq(0).css("zIndex"),b.each(i,function(){var a=b(this);/relative|absolute|fixed/i.test(a.css("position"))||a.css("position","relative")}),e=i.css({zIndex:Math.max(h.zIndex+1,"auto"==k?0:k)}));c.css({display:"block"}).fadeTo(h.loadSpeed,h.opacity,function(){b.mask.fit();f(h.onLoad)});d=!0;return this},close:function(){if(d){if(!1===f(n.onBeforeClose))return this;
c.fadeOut(n.closeSpeed,function(){f(n.onClose);e&&e.css({zIndex:k})});b(document).unbind("keydown.mask");c.unbind("click.mask");b(window).unbind("resize.mask");d=!1}return this},fit:function(){if(d){var a=g();c.css({width:a[0],height:a[1]})}},getMask:function(){return c},isLoaded:function(){return d},getConf:function(){return n},getExposed:function(){return e}};b.fn.mask=function(a){b.mask.load(a);return this};b.fn.expose=function(a){b.mask.load(a,this);return this}})(jQuery);
(function(b){function g(c,e){var d=this,g=c.add(d),k=b(window),h,i,l,j=b.tools.expose&&(e.mask||e.expose),p=Math.random().toString().slice(10);j&&("string"==typeof j&&(j={color:j}),j.closeOnClick=j.closeOnEsc=!1);var m=e.target||c.attr("rel");i=m?b(m):c;if(!i.length)throw"Could not find Overlay: "+m;c&&-1==c.index(i)&&c.click(function(a){d.load(a);return a.preventDefault()});b.extend(d,{load:function(c){if(d.isOpened())return d;var h=a[e.effect];if(!h)throw'Overlay: cannot find effect : "'+e.effect+
'"';e.oneInstance&&b.each(f,function(){this.close(c)});c=c||b.Event();c.type="onBeforeLoad";g.trigger(c);if(c.isDefaultPrevented())return d;l=true;j&&b(i).expose(j);var o=e.top,m=e.left,q=i.outerWidth({margin:true}),r=i.outerHeight({margin:true});typeof o=="string"&&(o=o=="center"?Math.max((k.height()-r)/2,0):parseInt(o,10)/100*k.height());m=="center"&&(m=Math.max((k.width()-q)/2,0));h[0].call(d,{top:o,left:m},function(){if(l){c.type="onLoad";g.trigger(c)}});if(j&&e.closeOnClick)b.mask.getMask().one("click",
d.close);e.closeOnClick&&b(document).bind("click."+p,function(a){b(a.target).parents(i).length||d.close(a)});e.closeOnEsc&&b(document).bind("keydown."+p,function(a){a.keyCode==27&&d.close(a)});return d},close:function(c){if(!d.isOpened())return d;c=c||b.Event();c.type="onBeforeClose";g.trigger(c);if(!c.isDefaultPrevented()){l=false;a[e.effect][1].call(d,function(){c.type="onClose";g.trigger(c)});b(document).unbind("click."+p).unbind("keydown."+p);j&&b.mask.close();return d}},getOverlay:function(){return i},
getTrigger:function(){return c},getClosers:function(){return h},isOpened:function(){return l},getConf:function(){return e}});b.each(["onBeforeLoad","onStart","onLoad","onBeforeClose","onClose"],function(a,c){b.isFunction(e[c])&&b(d).bind(c,e[c]);d[c]=function(a){b(d).bind(c,a);return d}});h=i.find(e.close||".close");!h.length&&!e.close&&(h=b('<a class="close"></a>'),i.prepend(h));h.click(function(a){d.close(a)});e.load&&d.load()}b.tools=b.tools||{version:"@VERSION"};b.tools.overlay={addEffect:function(c,
b,f){a[c]=[b,f]},conf:{close:null,closeOnClick:!0,closeOnEsc:!0,closeSpeed:"fast",effect:"default",fixed:!b.browser.msie||6<b.browser.version,left:"center",load:!1,mask:null,oneInstance:!0,speed:"normal",target:null,top:"10%"}};var f=[],a={};b.tools.overlay.addEffect("default",function(a,f){var d=this.getConf(),g=b(window);d.fixed||(a.top+=g.scrollTop(),a.left+=g.scrollLeft());a.position=d.fixed?"fixed":"absolute";this.getOverlay().css(a).fadeIn(d.speed,f)},function(a){this.getOverlay().fadeOut(this.getConf().closeSpeed,
a)});b.fn.overlay=function(a){var e=this.data("overlay");if(e)return e;b.isFunction(a)&&(a={onBeforeLoad:a});a=b.extend(!0,{},b.tools.overlay.conf,a);this.each(function(){e=new g(b(this),a);f.push(e);b(this).data("overlay",e)});return a.api?e:this}})(jQuery);
(function(b){b.fn.mqlkey=function(f){return this.each(function(){var a=b(this);if(a.is(":text")){var c=a.data("mqlkey");c&&c._destroy();c=new g(this,f);a.data("mqlkey",c)}})};var g=b.mqlkey=function(f,a){this.options=b.extend(!0,{},g.defaults,a);this.input=b(f);this.original=this.input.val();this.init()};g.prototype={init:function(){var f=this;this.input.bind("keyup.mqlkey",function(a){f.textchange(a)}).bind(b.browser.msie?"paste.mqlkey":"input.mqlkey",function(a){f.textchange(a)});this.options.source&&
(this.source=b(this.options.source),this.source_generate=""===this.source.val()?!0:!1,this.input.bind("change.mqlkey",function(){f.source_generate=!1}),this.source.bind("change.mqlkey",function(){if(f.source_generate){var a=g.from(f.source.val());f.input.val(a).trigger("keyup")}}))},_destroy:function(){this.input.unbind(".mqlkey");this.source&&this.source.unbind("change.mqlkey")},textchange:function(b){clearTimeout(this.textchange_timeout);var a=this;this.textchange_timeout=setTimeout(function(){a.textchange_delay(b)},
200)},textchange_delay:function(){this.input.trigger("textchange");var f=b.trim(this.input.val());return f===this.original&&""!==f?this.valid(f):g.reserved_word(f)?this.invalid(f,f+" is a reserved word."):g.test(f,this.options.schema)?f.length<this.options.minlen?this.invalid(f):this.options.check_key?this.check_key(f):this.valid(f):this.invalid(f)},check_key:function(b){var a=this;this.xhr&&(this.xhr=null);var c={id:null,key:{namespace:this.options.namespace,value:b}};clearTimeout(this.check_key.timeout);
this.check_key.timeout=setTimeout(function(){a.xhr=a.options.mqlread(c,function(c){return c?a.invalid(b,"Key already exists"):a.valid(b)},function(c){return c?a.invalid(c.responseText()):a.invalid("mqlread error!")})},200)},valid:function(b){this.input.trigger("valid",b)},invalid:function(b,a){a||(a=1<this.options.minlen?"Key must be "+this.options.minlen+" or more alphanumeric characters":"Key must be alphanumeric",a+=", lowercase, begin with a letter and not end with a non-alphanumeric character. Underscores are allowed but not consecutively.");
this.input.trigger("invalid",a)}};b.extend(g,{defaults:{minlen:1,check_key:!0,namespace:"/",mqlread:function(b,a,c){return g.mqlread(null,b,a,c)},source:null,schema:!1},mqlread:function(f,a,c,e){f={url:f||"http://api.freebase.com/api/service/mqlread",data:{query:JSON.stringify({query:a})},dataType:"jsonp",success:function(a){return c(a.result)},error:e};return b.ajax(f)},from:function(b){b=b.toLowerCase();b=b.replace(/[^a-z0-9]/g,"_");b=b.replace(/\_\_+/g,"_");b=b.replace(/[^a-z0-9]+$/,"");b=b.replace(/^[^a-z]+/,
"");g.reserved_word(b)&&(b="x_"+b);return b},reservedwords:"meta typeguid left right datatype scope attribute relationship property link class future update insert delete replace create destroy default sort limit offset optional pagesize cursor index !index for while as in is if else return count function read write select var connect this self super xml sql mql any all macro estimate-count",typeonlywords:"guid id object domain name key type keys value timestamp creator permission namespace unique schema reverse",
_reserved_word:null,reserved_word:function(f){g._reserved_word||(g._reserved_word={},b.each([g.reservedwords,g.typeonlywords],function(a,c){b.each(c.split(" "),function(a,c){g._reserved_word[c]=1})}));return 1===g._reserved_word[f]},fast:/^[A-Za-z0-9](?:[_-]?[A-Za-z0-9])*$/,slow:/^(?:[A-Za-z0-9]|\$[A-F0-9]{4})(?:[_-]?[A-Za-z0-9]|[_-]?\$[A-F0-9]{4})*$/,schema:/^[a-z](?:_?[a-z0-9])*$/,test:function(b,a){return a?g.schema.test(b):g.fast.test(b)||g.slow.test(b)}})})(jQuery);
(function(b,g){b(window).ajaxSend(function(a,b,e){"POST"===e.type&&b.setRequestHeader("x-acre-cache-control","max-age: 3600")});var f=g.schema.edit={init_edit_form:function(a){if("add"===a.mode)b("tbody",a.table).append(a.row);else if("edit"===a.mode)a.trigger_row.before(a.row);else throw"Unknown edit type mode: "+a.mode;a.trigger_row.before(a.submit_row);var c=a.event_prefix||"fb.schema.edit.";a.row.bind(c+"submit",function(){f.submit_edit_form(a)}).bind(c+"cancel",function(){f.cancel_edit_form(a)}).bind(c+
"error",function(b,c,g){f.row_error(c,g);a.row.removeClass("loading")}).bind(c+"success",function(){a.row.removeClass("loading")});b("button.save",a.submit_row).click(function(){a.row.trigger(c+"submit")});b(".button.cancel",a.submit_row).click(function(){a.row.trigger(c+"cancel")});a.row.showRow(function(){"function"===typeof a.init_form&&a.init_form(a)});a.trigger_row.hide();a.submit_row.show()},cancel_edit_form:function(a){a.row.hideRow(function(){b(this).remove()});f.clear_row_message(a.row);
a.submit_row.remove();a.trigger_row.show();a.trigger.removeClass("editing")},submit_edit_form:function(a){a.row.is(".loading")||(document.activeElement&&b(document.activeElement).blur(),f.clear_row_message(a.row),"function"===typeof a.validate_form&&a.validate_form(a),f.has_row_message(a.row,"error")||(a.row.addClass("loading"),"function"===typeof a.submit_form&&a.submit_form(a)))},ajax_error_handler:function(a,b,e){var d;try{d=JSON.parse(a.responseText),d.messages&&d.messages.length&&(d=JSON.stringify(d.messages[0]))}catch(g){}d||
(d=a.responseText);b?(f.row_error(b,d),b.removeClass("loading")):e&&(f.form_error(e,d),e.removeClass("loading"))},row_error:function(a,b){return f.row_message(a,b,"error")},row_message:function(a,c,e){var d=b('<a class="close-msg" href="#">Close</a>').click(function(a){return g.schema.close_message.apply(this,[a,".row-msg:first"])}),c=b("<span>").text(c),d=b('<td colspan="5">').append(d).append(c),d=b('<tr class="row-msg">').append(d);e&&d.addClass("row-msg-"+e);a.before(d);d.hide().showRow();c=a.data("row-msg");
c||(c={},a.data("row-msg",c));c[e]?c[e].push(d):c[e]=[d];return d},clear_row_message:function(a){var c=a.data("row-msg");c&&(b.each(c,function(a,c){b.each(c,function(a,b){b.remove()})}),a.removeData("row-msg"))},has_row_message:function(a,b){var e=a.data("row-msg");return b?e&&e[b]&&e[b].length:null!=e},init_modal_form:function(a){b(document.body).append(a.form.hide());var c=a.event_prefix||"fb.schema.edit.modal.";a.form.bind(c+"submit",function(){f.submit_modal_form(a)}).bind(c+"error",function(b,
c){f.form_error(a.form,c)}).bind(c+"success",function(){a.form.removeClass("loading")});b(".modal-buttons .button.save",a.form).click(function(){a.form.trigger(c+"submit")});a.form.overlay({close:".modal-buttons .button.cancel",closeOnClick:!1,load:!0,fixed:!1,mask:{color:"#000",loadSpeed:200,opacity:0.5},onLoad:function(){"function"===typeof a.init_form&&a.init_form(a)}});g.schema.init_modal_help(a.form)},submit_modal_form:function(a){a.form.is(".loading")||(document.activeElement&&b(document.activeElement).blur(),
f.clear_form_message(a.form),"function"===typeof a.validate_form&&a.validate_form(a),f.has_form_message(a.form,"error")||(a.form.addClass("loading"),"function"===typeof a.submit_form&&a.submit_form(a)))},form_error:function(a,b){return f.form_message(a,b,"error")},form_message:function(a,c,e){c=b("<div class='form-msg'>").text(c).hide();b(".form-group",a).prepend(c);c.slideDown();var d=a.data("form-msg");d||(d={},a.data("form-msg",d));d[e]?d[e].push(c):d[e]=[c];return c},clear_form_message:function(a){var c=
a.data("form-msg");c&&(b.each(c,function(a,c){b.each(c,function(a,b){b.remove()})}),a.removeData("form-msg"))},has_form_message:function(a,b){var e=a.data("form-msg");return b?e&&e[b]&&e[b].length:null!=e},init_mqlkey:function(a,c){a.mqlkey(c).bind("valid",function(){b(this).next(".key-status").removeClass("invalid").removeClass("loading").addClass("valid").text("valid").attr("title","Key is available")}).bind("invalid",function(a,c){b(this).next(".key-status").removeClass("valid").removeClass("loading").addClass("invalid").text("invalid").attr("title",
c)}).bind("textchange",function(){b(this).next(".key-status").removeClass("invalid").removeClass("valid").addClass("loading")})},validate_mqlkey:function(a,b){var e=a.form||a.row,d=b.next(".key-status"),f=b.val();return""===f?(e.trigger(a.event_prefix+"error","Key is required"),!1):f===b.data("mqlkey").original?!0:d.is(".invalid")?(e.trigger(a.event_prefix+"error",d.attr("title")),!1):d.is(".loading")?!1:!0}}})(jQuery,window.freebase);
