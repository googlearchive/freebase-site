
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
(function(c){c.fn.showRow=function(j,g,d){var g="fadeIn"===g?"fadeIn":"slideDown",a=this;return this.each(function(){var b=c(this).hide(),e=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">'),e=c(".wrapInner",e).hide();b.show();e[g](d,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});j&&j.call(a)})})};c.fn.hideRow=function(j,g,d){var g="fadeOut"===g?"fadeOut":"slideUp",a=this;return this.each(function(){var b=c(this).show(),e=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');
c(".wrapInner",e)[g](d,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});b.hide();j&&j.call(a)})})}})(jQuery);
(function(c){function j(a,b,e){var i=this,f=a.add(this),d=a.find(e.tabs),h=b.jquery?b:a.children(b),k;d.length||(d=a.children());h.length||(h=a.parent().find(b));h.length||(h=c(b));c.extend(this,{click:function(b,a){var h=d.eq(b);"string"==typeof b&&b.replace("#","")&&(b=b.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1"),h=d.filter("[href*="+b.replace("#","")+"]"),b=Math.max(d.index(h),0));if(e.rotate){var j=d.length-1;if(0>b)return i.click(j,a);if(b>j)return i.click(0,
a)}if(!h.length){if(0<=k)return i;b=e.initialIndex;h=d.eq(b)}if(b===k)return i;a=a||c.Event();a.type="onBeforeClick";f.trigger(a,[b]);if(!a.isDefaultPrevented())return g[e.effect].call(i,b,function(){a.type="onClick";f.trigger(a,[b])}),k=b,d.removeClass(e.current),h.addClass(e.current),i},getConf:function(){return e},getTabs:function(){return d},getPanes:function(){return h},getCurrentPane:function(){return h.eq(k)},getCurrentTab:function(){return d.eq(k)},getIndex:function(){return k},next:function(){return i.click(k+
1)},prev:function(){return i.click(k-1)},destroy:function(){d.unbind(e.event).removeClass(e.current);h.find("a[href^=#]").unbind("click.T");return i}});c.each(["onBeforeClick","onClick"],function(b,a){c.isFunction(e[a])&&c(i).bind(a,e[a]);i[a]=function(b){c(i).bind(a,b);return i}});e.history&&c.fn.history&&(c.tools.history.init(d),e.event="history");d.each(function(b){c(this).bind(e.event,function(a){i.click(b,a);return a.preventDefault()})});h.find("a[href^=#]").bind("click.T",function(b){i.click(c(this).attr("href"),
b)});location.hash?i.click(location.hash):(0===e.initialIndex||0<e.initialIndex)&&i.click(e.initialIndex)}c.tools=c.tools||{version:"@VERSION"};c.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:!1,history:!1},addEffect:function(a,b){g[a]=b}};var g={"default":function(a,b){this.getPanes().hide().eq(a).show();b.call()},fade:function(a,b){var c=this.getConf(),d=c.fadeOutSpeed,f=this.getPanes();d?f.fadeOut(d):f.hide();f.eq(a).fadeIn(c.fadeInSpeed,
b)},slide:function(a,b){this.getPanes().slideUp(200);this.getPanes().eq(a).slideDown(400,b)},ajax:function(a,b){this.getPanes().eq(0).load(this.getTabs().eq(a).attr("href"),b)}},d;c.tools.tabs.addEffect("horizontal",function(a,b){d||(d=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){c(this).hide()});this.getPanes().eq(a).animate({width:d},function(){c(this).show();b.call()})});c.fn.tabs=function(a,b){var e=this.data("tabs");e&&(e.destroy(),this.removeData("tabs"));
c.isFunction(b)&&(b={onBeforeClick:b});b=c.extend({},c.tools.tabs.conf,b);this.each(function(){e=new j(c(this),a,b);c(this).data("tabs",e)});return b.api?e:this}})(jQuery);
(function(c){function j(a,b,c){var d=c.relative?a.position().top:a.offset().top,f=c.relative?a.position().left:a.offset().left,g=c.position[0],d=d-(b.outerHeight()-c.offset[0]),f=f+(a.outerWidth()+c.offset[1]),h=b.outerHeight()+a.outerHeight();"center"==g&&(d+=h/2);"bottom"==g&&(d+=h);g=c.position[1];a=b.outerWidth()+a.outerWidth();"center"==g&&(f-=a/2);"left"==g&&(f-=a);return{top:d,left:f}}function g(a,b){var e=this,g=a.add(e),f,o=0,h=0,k=a.attr("title"),p=d[b.effect],m,q=a.is(":input"),s=q&&a.is(":checkbox, :radio, select, :button, :submit"),
r=a.attr("type"),n=b.events[r]||b.events[q?s?"widget":"input":"def"];if(!p)throw'Nonexistent effect "'+b.effect+'"';n=n.split(/,\s*/);if(2!=n.length)throw"Tooltip: bad events configuration for "+r;a.bind(n[0],function(a){clearTimeout(o);b.predelay?h=setTimeout(function(){e.show(a)},b.predelay):e.show(a)}).bind(n[1],function(a){clearTimeout(h);b.delay?o=setTimeout(function(){e.hide(a)},b.delay):e.hide(a)});k&&b.cancelDefault&&(a.removeAttr("title"),a.data("title",k));c.extend(e,{show:function(d){if(!f){if(k)f=
c(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(k);else if(b.tip)f=c(b.tip).eq(0);else{f=a.next();f.length||(f=a.parent().next())}if(!f.length)throw"Cannot find tooltip for "+a;}if(e.isShown())return e;f.stop(true,true);var l=j(a,f,b),d=d||c.Event();d.type="onBeforeShow";g.trigger(d,[l]);if(d.isDefaultPrevented())return e;l=j(a,f,b);f.css({position:"absolute",top:l.top,left:l.left});m=true;p[0].call(e,function(){d.type="onShow";m="full";g.trigger(d)});l=b.events.tooltip.split(/,\s*/);
f.bind(l[0],function(){clearTimeout(o);clearTimeout(h)});l[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&f.bind(l[1],function(b){b.relatedTarget!=a[0]&&a.trigger(n[1].split(" ")[0])});return e},hide:function(a){if(!f||!e.isShown())return e;a=a||c.Event();a.type="onBeforeHide";g.trigger(a);if(!a.isDefaultPrevented()){m=false;d[b.effect][1].call(e,function(){a.type="onHide";m=false;g.trigger(a)});return e}},isShown:function(a){return a?m=="full":m},getConf:function(){return b},getTip:function(){return f},
getTrigger:function(){return a}});c.each(["onHide","onBeforeShow","onShow","onBeforeHide"],function(a,d){c.isFunction(b[d])&&c(e).bind(d,b[d]);e[d]=function(a){c(e).bind(d,a);return e}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:!1,cancelDefault:!0,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,c){d[a]=[b,c]}};var d={toggle:[function(a){var b=this.getConf(),c=this.getTip(),b=b.opacity;1>b&&c.css({opacity:b});c.show();a.call()},function(a){this.getTip().hide();a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};c.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=c.extend(!0,{},c.tools.tooltip.conf,a);
"string"==typeof a.position&&(a.position=a.position.split(/,?\s/));this.each(function(){b=new g(c(this),a);c(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
(function(c,j){var g=j.schema={init_row_menu:function(d){c(".row-menu-trigger",d).each(function(){var a=c(this);a.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});a.parents("tr:first").hover(g.row_menu_hoverover,g.row_menu_hoverout)})},row_menu_hoverover:function(){var d=c(this);d.addClass("row-hover");c(".row-menu-trigger",d).css("visibility","visible")},row_menu_hoverout:function(){var d=c(this);c(".row-menu-trigger",d).css("visibility","hidden");
d.removeClass("row-hover")},close_message:function(d,a){var b=c(this).parents(a);b.is("tr")?b.hideRow(function(){b.remove()}):b.slideUp(function(){b.remove()});return!1},init_modal_help:function(d){c(".modal-help-toggle",d).click(function(){var a=c(this),b=a.parents().find(".modal-help"),d=a.parents().find(".modal-content");b.is(":hidden")?(b.height(d.height()-5).slideDown(),a.html("[ - ] Hide Help")):(b.slideUp(),a.html("[ + ] Show Help"))})}};c(function(){g.init_row_menu();var d=c(".breadcrumb-sibling-trigger").outerWidth();
c(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-d],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
