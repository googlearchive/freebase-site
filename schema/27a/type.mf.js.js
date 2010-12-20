
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
(function(c){c.fn.showRow=function(f,g,e){g=g==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var a=c(this).hide(),d=c("> td, > th",a).wrapInner('<div class="wrapInner" style="display: block;">');d=c(".wrapInner",d).hide();a.show();d[g](e,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});f&&f.call(b)})})};c.fn.hideRow=function(f,g,e){g=g==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var a=c(this).show(),d=c("> td, > th",a).wrapInner('<div class="wrapInner" style="display: block;">');
c(".wrapInner",d)[g](e,function(){c(this).each(function(){c(this).replaceWith(c(this).contents())});a.hide();f&&f.call(b)})})}})(jQuery);
(function(c){function f(b,a,d){var h=this,i=b.add(this),l=b.find(d.tabs),n=a.jquery?a:b.children(a),p;l.length||(l=b.children());n.length||(n=b.parent().find(a));n.length||(n=c(a));c.extend(this,{click:function(m,j){var q=l.eq(m);if(typeof m=="string"&&m.replace("#","")){q=l.filter("[href*="+m.replace("#","")+"]");m=Math.max(l.index(q),0)}if(d.rotate){var s=l.length-1;if(m<0)return h.click(s,j);if(m>s)return h.click(0,j)}if(!q.length){if(p>=0)return h;m=d.initialIndex;q=l.eq(m)}if(m===p)return h;
j=j||c.Event();j.type="onBeforeClick";i.trigger(j,[m]);if(!j.isDefaultPrevented()){g[d.effect].call(h,m,function(){j.type="onClick";i.trigger(j,[m])});p=m;l.removeClass(d.current);q.addClass(d.current);return h}},getConf:function(){return d},getTabs:function(){return l},getPanes:function(){return n},getCurrentPane:function(){return n.eq(p)},getCurrentTab:function(){return l.eq(p)},getIndex:function(){return p},next:function(){return h.click(p+1)},prev:function(){return h.click(p-1)},destroy:function(){l.unbind(d.event).removeClass(d.current);
n.find("a[href^=#]").unbind("click.T");return h}});c.each("onBeforeClick,onClick".split(","),function(m,j){c.isFunction(d[j])&&c(h).bind(j,d[j]);h[j]=function(q){c(h).bind(j,q);return h}});if(d.history&&c.fn.history){c.tools.history.init(l);d.event="history"}l.each(function(m){c(this).bind(d.event,function(j){h.click(m,j);return j.preventDefault()})});n.find("a[href^=#]").bind("click.T",function(m){h.click(c(this).attr("href"),m)});if(location.hash)h.click(location.hash);else if(d.initialIndex===
0||d.initialIndex>0)h.click(d.initialIndex)}c.tools=c.tools||{version:"@VERSION"};c.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,a){g[b]=a}};var g={"default":function(b,a){this.getPanes().hide().eq(b).show();a.call()},fade:function(b,a){var d=this.getConf(),h=d.fadeOutSpeed,i=this.getPanes();h?i.fadeOut(h):i.hide();i.eq(b).fadeIn(d.fadeInSpeed,a)},slide:function(b,a){this.getPanes().slideUp(200);
this.getPanes().eq(b).slideDown(400,a)},ajax:function(b,a){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),a)}},e;c.tools.tabs.addEffect("horizontal",function(b,a){e||(e=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){c(this).hide()});this.getPanes().eq(b).animate({width:e},function(){c(this).show();a.call()})});c.fn.tabs=function(b,a){var d=this.data("tabs");if(d){d.destroy();this.removeData("tabs")}if(c.isFunction(a))a={onBeforeClick:a};a=c.extend({},
c.tools.tabs.conf,a);this.each(function(){d=new f(c(this),b,a);c(this).data("tabs",d)});return a.api?d:this}})(jQuery);
(function(c){function f(b,a,d){var h=d.relative?b.position().top:b.offset().top,i=d.relative?b.position().left:b.offset().left,l=d.position[0];h-=a.outerHeight()-d.offset[0];i+=b.outerWidth()+d.offset[1];var n=a.outerHeight()+b.outerHeight();if(l=="center")h+=n/2;if(l=="bottom")h+=n;l=d.position[1];b=a.outerWidth()+b.outerWidth();if(l=="center")i-=b/2;if(l=="left")i-=b;return{top:h,left:i}}function g(b,a){var d=this,h=b.add(d),i,l=0,n=0,p=b.attr("title"),m=e[a.effect],j,q=b.is(":input"),s=q&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=a.events[u]||a.events[q?s?"widget":"input":"def"];if(!m)throw'Nonexistent effect "'+a.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(k){clearTimeout(l);if(a.predelay)n=setTimeout(function(){d.show(k)},a.predelay);else d.show(k)}).bind(r[1],function(k){clearTimeout(n);if(a.delay)l=setTimeout(function(){d.hide(k)},a.delay);else d.hide(k)});if(p&&a.cancelDefault){b.removeAttr("title");b.data("title",p)}c.extend(d,{show:function(k){if(!i){if(p)i=
c(a.layout).addClass(a.tipClass).appendTo(document.body).hide().append(p);else if(a.tip)i=c(a.tip).eq(0);else{i=b.next();i.length||(i=b.parent().next())}if(!i.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;i.stop(true,true);var o=f(b,i,a);k=k||c.Event();k.type="onBeforeShow";h.trigger(k,[o]);if(k.isDefaultPrevented())return d;o=f(b,i,a);i.css({position:"absolute",top:o.top,left:o.left});j=true;m[0].call(d,function(){k.type="onShow";j="full";h.trigger(k)});o=a.events.tooltip.split(/,\s*/);
i.bind(o[0],function(){clearTimeout(l);clearTimeout(n)});o[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&i.bind(o[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(k){if(!i||!d.isShown())return d;k=k||c.Event();k.type="onBeforeHide";h.trigger(k);if(!k.isDefaultPrevented()){j=false;e[a.effect][1].call(d,function(){k.type="onHide";j=false;h.trigger(k)});return d}},isShown:function(k){return k?j=="full":j},getConf:function(){return a},getTip:function(){return i},
getTrigger:function(){return b}});c.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(k,o){c.isFunction(a[o])&&c(d).bind(o,a[o]);d[o]=function(t){c(d).bind(o,t);return d}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,a,d){e[b]=[a,d]}};var e={toggle:[function(b){var a=this.getConf(),d=this.getTip();a=a.opacity;a<1&&d.css({opacity:a});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var a=this.getConf();this.getTip().fadeTo(a.fadeInSpeed,a.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};c.fn.tooltip=function(b){var a=this.data("tooltip");if(a)return a;b=c.extend(true,{},c.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){a=new g(c(this),b);c(this).data("tooltip",a)});return b.api?a:this}})(jQuery);
(function(c,f){var g=f.schema={init_row_menu:function(e){c(".row-menu-trigger",e).each(function(){var b=c(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(g.row_menu_hoverover,g.row_menu_hoverout)})},row_menu_hoverover:function(){var e=c(this);e.addClass("row-hover");c(".row-menu-trigger",e).css("visibility","visible")},row_menu_hoverout:function(){var e=c(this);c(".row-menu-trigger",e).css("visibility","hidden");
e.removeClass("row-hover")},close_message:function(e,b){var a=c(this).parents(b);a.is("tr")?a.hideRow(function(){a.remove()}):a.slideUp(function(){a.remove()});return false},init_modal_help:function(e){c(".modal-help-toggle",e).click(function(){var b=c(this),a=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(a.is(":hidden")){a.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{a.slideUp();b.html("[ + ] Show Help")}})}};c(function(){c.tablesorter.addParser({id:"schemaName",
is:function(){return false},format:function(d){return c(d).text().toLowerCase()},type:"text"});c.tablesorter.addParser({id:"commaDigit",is:function(){return false},format:function(d){return parseInt(d.replace(/\,/g,""))},type:"numeric"});c.tablesorter.defaults.cssAsc="column-header-asc";c.tablesorter.defaults.cssDesc="column-header-desc";c.tablesorter.defaults.cssHeader="column-header";g.init_row_menu();c(".blurb-trigger").click(function(){var d=c(this),h=d.siblings(".blurb"),i=d.siblings(".blob");
if(i.is(":hidden")){i.show();h.hide();d.text("Less")}else{i.hide();h.show();d.text("More")}});var e=c(".breadcrumb-sibling-trigger").outerWidth();c(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-e],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}});e=c("#language-select").change(function(){var d=c(this).val();c.cookie("lang",d,{path:"/"});window.location.reload(true)});
var b,a;c("option",e).each(function(){var d=c(this);if(d.val()==="/lang/en")b=d;if(d.val()===f.acre.lang.mql){a=d.attr("selected","selected");return false}});!a&&b&&b.attr("selected","selected")})})(jQuery,window.freebase);
(function(c,f){var g=f.schema.type={init:function(){c("#included-types-table .tbody-header, #incoming-properties-table .tbody-header").each(function(){var e=c(this);e.hasClass("expanded")||e.data("ajax",true);e.click(g.toggle)});g.init_tooltips()},init_tooltips:function(e){c(".return-link-trigger",e).tooltip({events:{def:"click,mouseout"},position:"top center",effect:"fade",delay:300,offset:[-8,0]})},toggle:function(){var e=c(this);if(e.data("ajax")){if(!e.is(".loading")){e.addClass("loading");c.ajax({url:e.attr("data-url"),
dataType:"json",success:function(b){b=c(b.result.html).hide();e.parents("thead:first").after(b);f.schema.init_row_menu(b);g.init_tooltips(b);g._toggle(e)},complete:function(){e.removeClass("loading");e.removeData("ajax")}})}}else g._toggle(e)},_toggle:function(e){var b=e.parents("thead:first").next("tbody:first");if(e.is(".expanded")){b.hide();e.removeClass("expanded");c(".tbody-header-title",e).removeClass("expanded")}else{b.css("display","table-row-group");e.addClass("expanded");c(".tbody-header-title",
e).addClass("expanded")}},init_edit:function(){c(".edit").show()},type_settings:function(e,b){var a=c(this);f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.type_settings_begin(a,b)});return false},reorder_property:function(e,b){var a=c(this);if(a.is(".editing"))return false;a.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.reorder_property_begin(a,b)});return false},add_property:function(e,b){var a=
c(this);if(a.is(".editing"))return false;a.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.add_property_begin(a,b)});return false},delete_property:function(e,b){var a=c(this);if(a.is(".editing"))return false;a.addClass("editing");a.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.delete_property_begin(a,b)});return false},
undo_delete_property:function(){var e=c(this);if(e.is(".editing"))return false;e.addClass("editing");var b=e.metadata();f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.undo_delete_property_begin(e,b)});return false},edit_property:function(e,b){var a=c(this);if(a.is(".editing"))return false;a.addClass("editing");a.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",
function(){g.edit.edit_property_begin(a,b)});return false},add_included_type:function(e,b){var a=c(this);if(a.is(".editing"))return false;a.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.add_included_type_begin(a,b)});return false},delete_included_type:function(e,b,a){e.stopPropagation();var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.delete_included_type_begin(d,
b,a)});return false},undo_delete_included_type:function(e,b,a){var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.undo_delete_included_type_begin(d,b,a)});return false},reverse_property:function(e,b,a){var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");d.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();f.get_script(f.acre.request.app_url+
"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.reverse_property_begin(d,b,a)});return false},add_instance:function(e,b){var a=c(this);if(a.is(".editing"))return false;a.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.add_instance_begin(a,b)});return false},delete_instance:function(e,b,a){var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");d.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.delete_instance_begin(d,b,a)});return false},undo_delete_instance:function(e,b,a){var d=c(this);if(d.is(".editing"))return false;d.addClass("editing");f.get_script(f.acre.request.app_url+"/schema/MANIFEST/type-edit.mf.js",function(){g.edit.undo_delete_instance_begin(d,b,a)});return false}};c(window).bind("fb.permission.has_permission",function(e,b){b&&g.init_edit()});c(g.init)})(jQuery,window.freebase);
