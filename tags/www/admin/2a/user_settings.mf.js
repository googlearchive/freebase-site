
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
(function(a){function l(){if(a.browser.msie){var b=a(document).height(),g=a(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,b-g<20?g:b]}return[a(document).width(),a(document).height()]}function i(b){if(b)return b.call(a.mask)}a.tools=a.tools||{version:"@VERSION"};var k;k=a.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:true,closeOnEsc:true,zIndex:9998,opacity:0.8,startOpacity:0,color:"#fff",onLoad:null,
onClose:null}};var c,d,e,j,m;a.mask={load:function(b,g){if(e)return this;if(typeof b=="string")b={color:b};b=b||j;j=b=a.extend(a.extend({},k.conf),b);c=a("#"+b.maskId);if(!c.length){c=a("<div/>").attr("id",b.maskId);a("body").append(c)}var o=l();c.css({position:"absolute",top:0,left:0,width:o[0],height:o[1],display:"none",opacity:b.startOpacity,zIndex:b.zIndex});b.color&&c.css("backgroundColor",b.color);if(i(b.onBeforeLoad)===false)return this;b.closeOnEsc&&a(document).bind("keydown.mask",function(h){h.keyCode==
27&&a.mask.close(h)});b.closeOnClick&&c.bind("click.mask",function(h){a.mask.close(h)});a(window).bind("resize.mask",function(){a.mask.fit()});if(g&&g.length){m=g.eq(0).css("zIndex");a.each(g,function(){var h=a(this);/relative|absolute|fixed/i.test(h.css("position"))||h.css("position","relative")});d=g.css({zIndex:Math.max(b.zIndex+1,m=="auto"?0:m)})}c.css({display:"block"}).fadeTo(b.loadSpeed,b.opacity,function(){a.mask.fit();i(b.onLoad)});e=true;return this},close:function(){if(e){if(i(j.onBeforeClose)===
false)return this;c.fadeOut(j.closeSpeed,function(){i(j.onClose);d&&d.css({zIndex:m})});a(document).unbind("keydown.mask");c.unbind("click.mask");a(window).unbind("resize.mask");e=false}return this},fit:function(){if(e){var b=l();c.css({width:b[0],height:b[1]})}},getMask:function(){return c},isLoaded:function(){return e},getConf:function(){return j},getExposed:function(){return d}};a.fn.mask=function(b){a.mask.load(b);return this};a.fn.expose=function(b){a.mask.load(b,this);return this}})(jQuery);
(function(a){function l(c,d){var e=this,j=c.add(e),m=a(window),b,g,o,h=a.tools.expose&&(d.mask||d.expose),r=Math.random().toString().slice(10);if(h){if(typeof h=="string")h={color:h};h.closeOnClick=h.closeOnEsc=false}var s=d.target||c.attr("rel");g=s?a(s):c;if(!g.length)throw"Could not find Overlay: "+s;c&&c.index(g)==-1&&c.click(function(f){e.load(f);return f.preventDefault()});a.extend(e,{load:function(f){if(e.isOpened())return e;var n=k[d.effect];if(!n)throw'Overlay: cannot find effect : "'+d.effect+
'"';d.oneInstance&&a.each(i,function(){this.close(f)});f=f||a.Event();f.type="onBeforeLoad";j.trigger(f);if(f.isDefaultPrevented())return e;o=true;h&&a(g).expose(h);var p=d.top,t=d.left,u=g.outerWidth({margin:true}),v=g.outerHeight({margin:true});if(typeof p=="string")p=p=="center"?Math.max((m.height()-v)/2,0):parseInt(p,10)/100*m.height();if(t=="center")t=Math.max((m.width()-u)/2,0);n[0].call(e,{top:p,left:t},function(){if(o){f.type="onLoad";j.trigger(f)}});h&&d.closeOnClick&&a.mask.getMask().one("click",
e.close);d.closeOnClick&&a(document).bind("click."+r,function(q){a(q.target).parents(g).length||e.close(q)});d.closeOnEsc&&a(document).bind("keydown."+r,function(q){q.keyCode==27&&e.close(q)});return e},close:function(f){if(!e.isOpened())return e;f=f||a.Event();f.type="onBeforeClose";j.trigger(f);if(!f.isDefaultPrevented()){o=false;k[d.effect][1].call(e,function(){f.type="onClose";j.trigger(f)});a(document).unbind("click."+r).unbind("keydown."+r);h&&a.mask.close();return e}},getOverlay:function(){return g},
getTrigger:function(){return c},getClosers:function(){return b},isOpened:function(){return o},getConf:function(){return d}});a.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(f,n){a.isFunction(d[n])&&a(e).bind(n,d[n]);e[n]=function(p){a(e).bind(n,p);return e}});b=g.find(d.close||".close");if(!b.length&&!d.close){b=a('<a class="close"></a>');g.prepend(b)}b.click(function(f){e.close(f)});d.load&&e.load()}a.tools=a.tools||{version:"@VERSION"};a.tools.overlay={addEffect:function(c,
d,e){k[c]=[d,e]},conf:{close:null,closeOnClick:true,closeOnEsc:true,closeSpeed:"fast",effect:"default",fixed:!a.browser.msie||a.browser.version>6,left:"center",load:false,mask:null,oneInstance:true,speed:"normal",target:null,top:"10%"}};var i=[],k={};a.tools.overlay.addEffect("default",function(c,d){var e=this.getConf(),j=a(window);if(!e.fixed){c.top+=j.scrollTop();c.left+=j.scrollLeft()}c.position=e.fixed?"fixed":"absolute";this.getOverlay().css(c).fadeIn(e.speed,d)},function(c){this.getOverlay().fadeOut(this.getConf().closeSpeed,
c)});a.fn.overlay=function(c){var d=this.data("overlay");if(d)return d;if(a.isFunction(c))c={onBeforeLoad:c};c=a.extend(true,{},a.tools.overlay.conf,c);this.each(function(){d=new l(a(this),c);i.push(d);a(this).data("overlay",d)});return c.api?d:this}})(jQuery);
(function(a,l){a.extend(l.nav_ajax,{begin:function(i){i=i.href.split("/");i.pop();i.push("user_settings_begin.ajax");a.ajax({url:i.join("/"),data:{id:l.c.id},dataType:"json",success:function(k){k=a(k.result.html);l.nav_ajax.init(k)},error:function(k){console.error(k)}})},init:function(i){a(document.body).append(i.hide());i.overlay({close:".modal-buttons .button-cancel",closeOnClick:false,load:true,mask:{color:"#000",loadSpeed:200,opacity:0.5},onLoad:function(){l.nav_ajax.init_form(i)}})},init_form:function(){}})})(jQuery,
window.freebase);
