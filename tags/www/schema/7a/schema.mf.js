
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
 
 jQuery Tools @VERSION Tabs- The basics of UI design.

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tabs/

 Since: November 2008
 Date: @DATE 
 
 jQuery Tools @VERSION Tooltip - UI essentials

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tooltip/

 Since: November 2008
 Date: @DATE 
*/
(function(c){c.fn.showRow=function(p,l,h){l=l==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var a=c(this).hide(),d=c("> td, > th",a).wrapInner('<div class="wrapInner" style="display: block;">');d=c(".wrapInner",d).hide();a.show();d[l](h,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});p&&p.call(b)})})};c.fn.hideRow=function(p,l,h){l=l==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var a=c(this).show(),d=c("> td, > th",a).wrapInner('<div class="wrapInner" style="display: block;">');
c(".wrapInner",d)[l](h,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});a.hide();p&&p.call(b)})})}})(jQuery);
(function(c){function p(b,a,d){var e=this,f=b.add(this),k=b.find(d.tabs),m=a.jquery?a:b.children(a),o;k.length||(k=b.children());m.length||(m=b.parent().find(a));m.length||(m=c(a));c.extend(this,{click:function(i,g){var q=k.eq(i);if(typeof i=="string"&&i.replace("#","")){i=i.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");q=k.filter("[href*="+i.replace("#","")+"]");i=Math.max(k.index(q),0)}if(d.rotate){var s=k.length-1;if(i<0)return e.click(s,g);if(i>s)return e.click(0,
g)}if(!q.length){if(o>=0)return e;i=d.initialIndex;q=k.eq(i)}if(i===o)return e;g=g||c.Event();g.type="onBeforeClick";f.trigger(g,[i]);if(!g.isDefaultPrevented()){l[d.effect].call(e,i,function(){g.type="onClick";f.trigger(g,[i])});o=i;k.removeClass(d.current);q.addClass(d.current);return e}},getConf:function(){return d},getTabs:function(){return k},getPanes:function(){return m},getCurrentPane:function(){return m.eq(o)},getCurrentTab:function(){return k.eq(o)},getIndex:function(){return o},next:function(){return e.click(o+
1)},prev:function(){return e.click(o-1)},destroy:function(){k.unbind(d.event).removeClass(d.current);m.find("a[href^=#]").unbind("click.T");return e}});c.each("onBeforeClick,onClick".split(","),function(i,g){c.isFunction(d[g])&&c(e).bind(g,d[g]);e[g]=function(q){c(e).bind(g,q);return e}});if(d.history&&c.fn.history){c.tools.history.init(k);d.event="history"}k.each(function(i){c(this).bind(d.event,function(g){e.click(i,g);return g.preventDefault()})});m.find("a[href^=#]").bind("click.T",function(i){e.click(c(this).attr("href"),
i)});if(location.hash)e.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)e.click(d.initialIndex)}c.tools=c.tools||{version:"@VERSION"};c.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,a){l[b]=a}};var l={"default":function(b,a){this.getPanes().hide().eq(b).show();a.call()},fade:function(b,a){var d=this.getConf(),e=d.fadeOutSpeed,f=this.getPanes();e?f.fadeOut(e):
f.hide();f.eq(b).fadeIn(d.fadeInSpeed,a)},slide:function(b,a){this.getPanes().slideUp(200);this.getPanes().eq(b).slideDown(400,a)},ajax:function(b,a){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),a)}},h;c.tools.tabs.addEffect("horizontal",function(b,a){h||(h=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){c(this).hide()});this.getPanes().eq(b).animate({width:h},function(){c(this).show();a.call()})});c.fn.tabs=function(b,a){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(c.isFunction(a))a={onBeforeClick:a};a=c.extend({},c.tools.tabs.conf,a);this.each(function(){d=new p(c(this),b,a);c(this).data("tabs",d)});return a.api?d:this}})(jQuery);
(function(c){function p(b,a,d){var e=d.relative?b.position().top:b.offset().top,f=d.relative?b.position().left:b.offset().left,k=d.position[0];e-=a.outerHeight()-d.offset[0];f+=b.outerWidth()+d.offset[1];var m=a.outerHeight()+b.outerHeight();if(k=="center")e+=m/2;if(k=="bottom")e+=m;k=d.position[1];b=a.outerWidth()+b.outerWidth();if(k=="center")f-=b/2;if(k=="left")f-=b;return{top:e,left:f}}function l(b,a){var d=this,e=b.add(d),f,k=0,m=0,o=b.attr("title"),i=h[a.effect],g,q=b.is(":input"),s=q&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=a.events[u]||a.events[q?s?"widget":"input":"def"];if(!i)throw'Nonexistent effect "'+a.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(j){clearTimeout(k);if(a.predelay)m=setTimeout(function(){d.show(j)},a.predelay);else d.show(j)}).bind(r[1],function(j){clearTimeout(m);if(a.delay)k=setTimeout(function(){d.hide(j)},a.delay);else d.hide(j)});if(o&&a.cancelDefault){b.removeAttr("title");b.data("title",o)}c.extend(d,{show:function(j){if(!f){if(o)f=
c(a.layout).addClass(a.tipClass).appendTo(document.body).hide().append(o);else if(a.tip)f=c(a.tip).eq(0);else{f=b.next();f.length||(f=b.parent().next())}if(!f.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;f.stop(true,true);var n=p(b,f,a);j=j||c.Event();j.type="onBeforeShow";e.trigger(j,[n]);if(j.isDefaultPrevented())return d;n=p(b,f,a);f.css({position:"absolute",top:n.top,left:n.left});g=true;i[0].call(d,function(){j.type="onShow";g="full";e.trigger(j)});n=a.events.tooltip.split(/,\s*/);
f.bind(n[0],function(){clearTimeout(k);clearTimeout(m)});n[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&f.bind(n[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(j){if(!f||!d.isShown())return d;j=j||c.Event();j.type="onBeforeHide";e.trigger(j);if(!j.isDefaultPrevented()){g=false;h[a.effect][1].call(d,function(){j.type="onHide";g=false;e.trigger(j)});return d}},isShown:function(j){return j?g=="full":g},getConf:function(){return a},getTip:function(){return f},
getTrigger:function(){return b}});c.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(j,n){c.isFunction(a[n])&&c(d).bind(n,a[n]);d[n]=function(t){c(d).bind(n,t);return d}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,a,d){h[b]=[a,d]}};var h={toggle:[function(b){var a=this.getConf(),d=this.getTip();a=a.opacity;a<1&&d.css({opacity:a});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var a=this.getConf();this.getTip().fadeTo(a.fadeInSpeed,a.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};c.fn.tooltip=function(b){var a=this.data("tooltip");if(a)return a;b=c.extend(true,{},c.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){a=new l(c(this),b);c(this).data("tooltip",a)});return b.api?a:this}})(jQuery);
(function(c,p){var l=p.schema={init_row_menu:function(h){c(".row-menu-trigger",h).each(function(){var b=c(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(l.row_menu_hoverover,l.row_menu_hoverout)})},row_menu_hoverover:function(){var h=c(this);h.addClass("row-hover");c(".row-menu-trigger",h).css("visibility","visible")},row_menu_hoverout:function(){var h=c(this);c(".row-menu-trigger",h).css("visibility","hidden");
h.removeClass("row-hover")},close_message:function(h,b){var a=c(this).parents(b);a.is("tr")?a.hideRow(function(){a.remove()}):a.slideUp(function(){a.remove()});return false},init_modal_help:function(h){c(".modal-help-toggle",h).click(function(){var b=c(this),a=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(a.is(":hidden")){a.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{a.slideUp();b.html("[ + ] Show Help")}})}};c(function(){l.init_row_menu();var h=c(".breadcrumb-sibling-trigger").outerWidth();
c(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-h],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
