
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
(function(c){c.fn.showRow=function(f,g,d){var g="fadeIn"===g?"fadeIn":"slideDown",a=this;return this.each(function(){var b=c(this).hide(),e=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">'),e=c(".wrapInner",e).hide();b.show();e[g](d,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});f&&f.call(a)})})};c.fn.hideRow=function(f,g,d){var g="fadeOut"===g?"fadeOut":"slideUp",a=this;return this.each(function(){var b=c(this).show(),e=c("> td, > th",b).wrapInner('<div class="wrapInner" style="display: block;">');
c(".wrapInner",e)[g](d,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});b.hide();f&&f.call(a)})})}})(jQuery);
(function(c){function f(a,b,e){var d=this,f=a.add(this),i=a.find(e.tabs),h=b.jquery?b:a.children(b),k;i.length||(i=a.children());h.length||(h=a.parent().find(b));h.length||(h=c(b));c.extend(this,{click:function(b,a){var h=i.eq(b);"string"==typeof b&&b.replace("#","")&&(b=b.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1"),h=i.filter("[href*="+b.replace("#","")+"]"),b=Math.max(i.index(h),0));if(e.rotate){var o=i.length-1;if(0>b)return d.click(o,a);if(b>o)return d.click(0,
a)}if(!h.length){if(0<=k)return d;b=e.initialIndex;h=i.eq(b)}if(b===k)return d;a=a||c.Event();a.type="onBeforeClick";f.trigger(a,[b]);if(!a.isDefaultPrevented())return g[e.effect].call(d,b,function(){a.type="onClick";f.trigger(a,[b])}),k=b,i.removeClass(e.current),h.addClass(e.current),d},getConf:function(){return e},getTabs:function(){return i},getPanes:function(){return h},getCurrentPane:function(){return h.eq(k)},getCurrentTab:function(){return i.eq(k)},getIndex:function(){return k},next:function(){return d.click(k+
1)},prev:function(){return d.click(k-1)},destroy:function(){i.unbind(e.event).removeClass(e.current);h.find("a[href^=#]").unbind("click.T");return d}});c.each(["onBeforeClick","onClick"],function(b,a){c.isFunction(e[a])&&c(d).bind(a,e[a]);d[a]=function(b){c(d).bind(a,b);return d}});e.history&&c.fn.history&&(c.tools.history.init(i),e.event="history");i.each(function(b){c(this).bind(e.event,function(a){d.click(b,a);return a.preventDefault()})});h.find("a[href^=#]").bind("click.T",function(b){d.click(c(this).attr("href"),
b)});location.hash?d.click(location.hash):(0===e.initialIndex||0<e.initialIndex)&&d.click(e.initialIndex)}c.tools=c.tools||{version:"@VERSION"};c.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:!1,history:!1},addEffect:function(a,b){g[a]=b}};var g={"default":function(a,b){this.getPanes().hide().eq(a).show();b.call()},fade:function(a,b){var c=this.getConf(),d=c.fadeOutSpeed,f=this.getPanes();d?f.fadeOut(d):f.hide();f.eq(a).fadeIn(c.fadeInSpeed,
b)},slide:function(a,b){this.getPanes().slideUp(200);this.getPanes().eq(a).slideDown(400,b)},ajax:function(a,b){this.getPanes().eq(0).load(this.getTabs().eq(a).attr("href"),b)}},d;c.tools.tabs.addEffect("horizontal",function(a,b){d||(d=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){c(this).hide()});this.getPanes().eq(a).animate({width:d},function(){c(this).show();b.call()})});c.fn.tabs=function(a,b){var e=this.data("tabs");e&&(e.destroy(),this.removeData("tabs"));
c.isFunction(b)&&(b={onBeforeClick:b});b=c.extend({},c.tools.tabs.conf,b);this.each(function(){e=new f(c(this),a,b);c(this).data("tabs",e)});return b.api?e:this}})(jQuery);
(function(c){function f(a,b,c){var d=c.relative?a.position().top:a.offset().top,f=c.relative?a.position().left:a.offset().left,g=c.position[0],d=d-(b.outerHeight()-c.offset[0]),f=f+(a.outerWidth()+c.offset[1]),h=b.outerHeight()+a.outerHeight();"center"==g&&(d+=h/2);"bottom"==g&&(d+=h);g=c.position[1];a=b.outerWidth()+a.outerWidth();"center"==g&&(f-=a/2);"left"==g&&(f-=a);return{top:d,left:f}}function g(a,b){var e=this,g=a.add(e),j,i=0,h=0,k=a.attr("title"),p=d[b.effect],m,q=a.is(":input"),o=q&&a.is(":checkbox, :radio, select, :button, :submit"),
r=a.attr("type"),n=b.events[r]||b.events[q?o?"widget":"input":"def"];if(!p)throw'Nonexistent effect "'+b.effect+'"';n=n.split(/,\s*/);if(2!=n.length)throw"Tooltip: bad events configuration for "+r;a.bind(n[0],function(a){clearTimeout(i);b.predelay?h=setTimeout(function(){e.show(a)},b.predelay):e.show(a)}).bind(n[1],function(a){clearTimeout(h);b.delay?i=setTimeout(function(){e.hide(a)},b.delay):e.hide(a)});k&&b.cancelDefault&&(a.removeAttr("title"),a.data("title",k));c.extend(e,{show:function(d){if(!j){if(k)j=
c(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(k);else if(b.tip)j=c(b.tip).eq(0);else{j=a.next();j.length||(j=a.parent().next())}if(!j.length)throw"Cannot find tooltip for "+a;}if(e.isShown())return e;j.stop(true,true);var l=f(a,j,b),d=d||c.Event();d.type="onBeforeShow";g.trigger(d,[l]);if(d.isDefaultPrevented())return e;l=f(a,j,b);j.css({position:"absolute",top:l.top,left:l.left});m=true;p[0].call(e,function(){d.type="onShow";m="full";g.trigger(d)});l=b.events.tooltip.split(/,\s*/);
j.bind(l[0],function(){clearTimeout(i);clearTimeout(h)});l[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&j.bind(l[1],function(b){b.relatedTarget!=a[0]&&a.trigger(n[1].split(" ")[0])});return e},hide:function(a){if(!j||!e.isShown())return e;a=a||c.Event();a.type="onBeforeHide";g.trigger(a);if(!a.isDefaultPrevented()){m=false;d[b.effect][1].call(e,function(){a.type="onHide";m=false;g.trigger(a)});return e}},isShown:function(a){return a?m=="full":m},getConf:function(){return b},getTip:function(){return j},
getTrigger:function(){return a}});c.each(["onHide","onBeforeShow","onShow","onBeforeHide"],function(a,d){c.isFunction(b[d])&&c(e).bind(d,b[d]);e[d]=function(a){c(e).bind(d,a);return e}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:!1,cancelDefault:!0,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,c){d[a]=[b,c]}};var d={toggle:[function(a){var b=this.getConf(),c=this.getTip(),b=b.opacity;1>b&&c.css({opacity:b});c.show();a.call()},function(a){this.getTip().hide();a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};c.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=c.extend(!0,{},c.tools.tooltip.conf,a);
"string"==typeof a.position&&(a.position=a.position.split(/,?\s/));this.each(function(){b=new g(c(this),a);c(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
(function(c,f){var g=f.schema={init_row_menu:function(d){c(".row-menu-trigger",d).each(function(){var a=c(this);a.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});a.parents("tr:first").hover(g.row_menu_hoverover,g.row_menu_hoverout)})},row_menu_hoverover:function(){var d=c(this);d.addClass("row-hover");c(".row-menu-trigger",d).css("visibility","visible")},row_menu_hoverout:function(){var d=c(this);c(".row-menu-trigger",d).css("visibility","hidden");
d.removeClass("row-hover")},close_message:function(d,a){var b=c(this).parents(a);b.is("tr")?b.hideRow(function(){b.remove()}):b.slideUp(function(){b.remove()});return!1},init_modal_help:function(d){c(".modal-help-toggle",d).click(function(){var a=c(this),b=a.parents().find(".modal-help"),d=a.parents().find(".modal-content");b.is(":hidden")?(b.height(d.height()-5).slideDown(),a.html("[ - ] Hide Help")):(b.slideUp(),a.html("[ + ] Show Help"))})}};c(function(){g.init_row_menu();var d=c(".breadcrumb-sibling-trigger").outerWidth();
c(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-d],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
(function(c,f){var g=f.schema.type={init:function(){c("#included-types-table .tbody-header, #incoming-properties-table .tbody-header").each(function(){var d=c(this);d.hasClass("expanded")||d.data("ajax",!0);d.click(g.toggle)});g.init_tooltips()},init_tooltips:function(d){c(".return-link-trigger",d).tooltip({events:{def:"click,mouseout"},position:"top center",effect:"fade",delay:300,offset:[-8,0]})},toggle:function(){var d=c(this);d.data("ajax")?d.is(".loading")||(d.addClass("loading"),c.ajax({url:d.attr("data-url"),
dataType:"json",success:function(a){a=c(a.result.html).hide();d.parents("thead:first").after(a);f.schema.init_row_menu(a);g.init_tooltips(a);g._toggle(d)},complete:function(){d.removeClass("loading");d.removeData("ajax")}})):g._toggle(d)},_toggle:function(d){var a=d.parents("thead:first").next("tbody:first");d.is(".expanded")?(a.hide(),d.removeClass("expanded"),c(".tbody-header-title",d).removeClass("expanded")):(a.css("display","table-row-group"),d.addClass("expanded"),c(".tbody-header-title",d).addClass("expanded"))},
reorder_property:function(d,a){var b=c(this);if(b.is(".editing"))return!1;b.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.reorder_property_begin(b,a)});return!1},add_property:function(d,a){var b=c(this);if(b.is(".editing"))return!1;b.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.add_property_begin(b,a)});return!1},edit_property:function(d,a){var b=c(this);if(b.is(".editing"))return!1;b.addClass("editing");b.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.edit_property_begin(b,a)});return!1},add_included_type:function(d,a){var b=c(this);if(b.is(".editing"))return!1;b.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.add_included_type_begin(b,a)});return!1},delete_included_type:function(d,a,b){d.stopPropagation();var e=c(this);if(e.is(".editing"))return!1;e.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.delete_included_type_begin(e,
a,b)});return!1},undo_delete_included_type:function(d,a,b){var e=c(this);if(e.is(".editing"))return!1;e.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.undo_delete_included_type_begin(e,a,b)});return!1},reverse_property:function(d,a,b){var e=c(this);if(e.is(".editing"))return!1;e.addClass("editing");e.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.reverse_property_begin(e,
a,b)});return!1},add_instance:function(d,a){var b=c(this);if(b.is(".editing"))return!1;b.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.add_instance_begin(b,a)});return!1},delete_instance:function(d,a,b){var e=c(this);if(e.is(".editing"))return!1;e.addClass("editing");e.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.delete_instance_begin(e,a,b)});return!1},undo_delete_instance:function(d,
a,b){var e=c(this);if(e.is(".editing"))return!1;e.addClass("editing");f.get_script(f.h.static_url("type-edit.mf.js"),function(){g.edit.undo_delete_instance_begin(e,a,b)});return!1}};c(g.init)})(jQuery,window.freebase);
