
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
(function(c){c.fn.showRow=function(m,k,e){k=k==="fadeIn"?"fadeIn":"slideDown";var a=this;return this.each(function(){var b=c(this).hide(),d=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');d=c(".wrapInner",d).hide();b.show();d[k](e,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});m&&m.call(a)})})};c.fn.hideRow=function(m,k,e){k=k==="fadeOut"?"fadeOut":"slideUp";var a=this;return this.each(function(){var b=c(this).show(),d=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');
c(".wrapInner",d)[k](e,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});b.hide();m&&m.call(a)})})}})(jQuery);
(function(c){function m(a,b,d){var f=this,g=a.add(this),l=a.find(d.tabs),n=b.jquery?b:a.children(b),p;l.length||(l=a.children());n.length||(n=a.parent().find(b));n.length||(n=c(b));c.extend(this,{click:function(i,h){var q=l.eq(i);if(typeof i=="string"&&i.replace("#","")){i=i.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");q=l.filter("[href*="+i.replace("#","")+"]");i=Math.max(l.index(q),0)}if(d.rotate){var s=l.length-1;if(i<0)return f.click(s,h);if(i>s)return f.click(0,
h)}if(!q.length){if(p>=0)return f;i=d.initialIndex;q=l.eq(i)}if(i===p)return f;h=h||c.Event();h.type="onBeforeClick";g.trigger(h,[i]);if(!h.isDefaultPrevented()){k[d.effect].call(f,i,function(){h.type="onClick";g.trigger(h,[i])});p=i;l.removeClass(d.current);q.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return l},getPanes:function(){return n},getCurrentPane:function(){return n.eq(p)},getCurrentTab:function(){return l.eq(p)},getIndex:function(){return p},next:function(){return f.click(p+
1)},prev:function(){return f.click(p-1)},destroy:function(){l.unbind(d.event).removeClass(d.current);n.find("a[href^=#]").unbind("click.T");return f}});c.each("onBeforeClick,onClick".split(","),function(i,h){c.isFunction(d[h])&&c(f).bind(h,d[h]);f[h]=function(q){c(f).bind(h,q);return f}});if(d.history&&c.fn.history){c.tools.history.init(l);d.event="history"}l.each(function(i){c(this).bind(d.event,function(h){f.click(i,h);return h.preventDefault()})});n.find("a[href^=#]").bind("click.T",function(i){f.click(c(this).attr("href"),
i)});if(location.hash)f.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)f.click(d.initialIndex)}c.tools=c.tools||{version:"@VERSION"};c.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(a,b){k[a]=b}};var k={"default":function(a,b){this.getPanes().hide().eq(a).show();b.call()},fade:function(a,b){var d=this.getConf(),f=d.fadeOutSpeed,g=this.getPanes();f?g.fadeOut(f):
g.hide();g.eq(a).fadeIn(d.fadeInSpeed,b)},slide:function(a,b){this.getPanes().slideUp(200);this.getPanes().eq(a).slideDown(400,b)},ajax:function(a,b){this.getPanes().eq(0).load(this.getTabs().eq(a).attr("href"),b)}},e;c.tools.tabs.addEffect("horizontal",function(a,b){e||(e=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){c(this).hide()});this.getPanes().eq(a).animate({width:e},function(){c(this).show();b.call()})});c.fn.tabs=function(a,b){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(c.isFunction(b))b={onBeforeClick:b};b=c.extend({},c.tools.tabs.conf,b);this.each(function(){d=new m(c(this),a,b);c(this).data("tabs",d)});return b.api?d:this}})(jQuery);
(function(c){function m(a,b,d){var f=d.relative?a.position().top:a.offset().top,g=d.relative?a.position().left:a.offset().left,l=d.position[0];f-=b.outerHeight()-d.offset[0];g+=a.outerWidth()+d.offset[1];var n=b.outerHeight()+a.outerHeight();if(l=="center")f+=n/2;if(l=="bottom")f+=n;l=d.position[1];a=b.outerWidth()+a.outerWidth();if(l=="center")g-=a/2;if(l=="left")g-=a;return{top:f,left:g}}function k(a,b){var d=this,f=a.add(d),g,l=0,n=0,p=a.attr("title"),i=e[b.effect],h,q=a.is(":input"),s=q&&a.is(":checkbox, :radio, select, :button, :submit"),
u=a.attr("type"),r=b.events[u]||b.events[q?s?"widget":"input":"def"];if(!i)throw'Nonexistent effect "'+b.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;a.bind(r[0],function(j){clearTimeout(l);if(b.predelay)n=setTimeout(function(){d.show(j)},b.predelay);else d.show(j)}).bind(r[1],function(j){clearTimeout(n);if(b.delay)l=setTimeout(function(){d.hide(j)},b.delay);else d.hide(j)});if(p&&b.cancelDefault){a.removeAttr("title");a.data("title",p)}c.extend(d,{show:function(j){if(!g){if(p)g=
c(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(p);else if(b.tip)g=c(b.tip).eq(0);else{g=a.next();g.length||(g=a.parent().next())}if(!g.length)throw"Cannot find tooltip for "+a;}if(d.isShown())return d;g.stop(true,true);var o=m(a,g,b);j=j||c.Event();j.type="onBeforeShow";f.trigger(j,[o]);if(j.isDefaultPrevented())return d;o=m(a,g,b);g.css({position:"absolute",top:o.top,left:o.left});h=true;i[0].call(d,function(){j.type="onShow";h="full";f.trigger(j)});o=b.events.tooltip.split(/,\s*/);
g.bind(o[0],function(){clearTimeout(l);clearTimeout(n)});o[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&g.bind(o[1],function(t){t.relatedTarget!=a[0]&&a.trigger(r[1].split(" ")[0])});return d},hide:function(j){if(!g||!d.isShown())return d;j=j||c.Event();j.type="onBeforeHide";f.trigger(j);if(!j.isDefaultPrevented()){h=false;e[b.effect][1].call(d,function(){j.type="onHide";h=false;f.trigger(j)});return d}},isShown:function(j){return j?h=="full":h},getConf:function(){return b},getTip:function(){return g},
getTrigger:function(){return a}});c.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(j,o){c.isFunction(b[o])&&c(d).bind(o,b[o]);d[o]=function(t){c(d).bind(o,t);return d}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,d){e[a]=[b,d]}};var e={toggle:[function(a){var b=this.getConf(),d=this.getTip();b=b.opacity;b<1&&d.css({opacity:b});d.show();a.call()},function(a){this.getTip().hide();a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};c.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=c.extend(true,{},c.tools.tooltip.conf,a);
if(typeof a.position=="string")a.position=a.position.split(/,?\s/);this.each(function(){b=new k(c(this),a);c(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
(function(c,m){var k=m.schema={init_row_menu:function(e){c(".row-menu-trigger",e).each(function(){var a=c(this);a.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});a.parents("tr:first").hover(k.row_menu_hoverover,k.row_menu_hoverout)})},row_menu_hoverover:function(){var e=c(this);e.addClass("row-hover");c(".row-menu-trigger",e).css("visibility","visible")},row_menu_hoverout:function(){var e=c(this);c(".row-menu-trigger",e).css("visibility","hidden");
e.removeClass("row-hover")},close_message:function(e,a){var b=c(this).parents(a);b.is("tr")?b.hideRow(function(){b.remove()}):b.slideUp(function(){b.remove()});return false},init_modal_help:function(e){c(".modal-help-toggle",e).click(function(){var a=c(this),b=a.parents().find(".modal-help"),d=a.parents().find(".modal-content");if(b.is(":hidden")){b.height(d.height()-5).slideDown();a.html("[ - ] Hide Help")}else{b.slideUp();a.html("[ + ] Show Help")}})}};c(function(){k.init_row_menu();var e=c(".breadcrumb-sibling-trigger").outerWidth();
c(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-e],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
(function(c,m){var k=m.schema.domain={init:function(){k.init_tablesorter();k.init_toggle_help_messages()},init_tablesorter:function(){c(".table-sortable").each(function(){var e=c(this);if(c("> tbody > tr",e).length){c("thead th:nth-child(2)",e)[0].count=1;c("thead th:nth-child(3)",e)[0].count=1;c("thead th:nth-child(4)",e)[0].count=1}})},init_toggle_help_messages:function(){c(".table-empty-trigger").click(function(){var e=c(this).parents(".table-empty-msg"),a=e.find(".table-empty-text");if(a.is(":hidden")){e.addClass("active");
a.slideDown()}else{e.removeClass("active");a.slideUp()}})},init_edit:function(){var e=c("table.table");e.first().find(".table-empty-msg").addClass("active").find(".table-empty-text").slideDown();e.find("tbody > tr").length===0?c(".table-title > .help-link").hide():c(".table-empty-msg").hide()},add_type:function(e,a,b){var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");m.get_script(m.h.static_url("domain-edit.mf.js"),function(){k.edit.add_type_begin(d,a,b)});return false},edit_type:function(e,
a){var b=c(this);if(b.is(".editing"))return false;b.addClass("editing");b.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();m.get_script(m.h.static_url("domain-edit.mf.js"),function(){k.edit.edit_type_begin(b,a)});return false}};c(window).bind("fb.permission.has_permission",function(e,a){a&&k.init_edit()});c(k.init)})(jQuery,window.freebase);
