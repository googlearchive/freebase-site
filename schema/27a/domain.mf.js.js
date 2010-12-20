
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
(function(a){a.fn.showRow=function(i,h,e){h=h==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var c=a(this).hide(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();c.show();d[h](e,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});i&&i.call(b)})})};a.fn.hideRow=function(i,h,e){h=h==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var c=a(this).show(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[h](e,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c.hide();i&&i.call(b)})})}})(jQuery);
(function(a){function i(b,c,d){var f=this,g=b.add(this),l=b.find(d.tabs),n=c.jquery?c:b.children(c),p;l.length||(l=b.children());n.length||(n=b.parent().find(c));n.length||(n=a(c));a.extend(this,{click:function(m,j){var q=l.eq(m);if(typeof m=="string"&&m.replace("#","")){q=l.filter("[href*="+m.replace("#","")+"]");m=Math.max(l.index(q),0)}if(d.rotate){var s=l.length-1;if(m<0)return f.click(s,j);if(m>s)return f.click(0,j)}if(!q.length){if(p>=0)return f;m=d.initialIndex;q=l.eq(m)}if(m===p)return f;
j=j||a.Event();j.type="onBeforeClick";g.trigger(j,[m]);if(!j.isDefaultPrevented()){h[d.effect].call(f,m,function(){j.type="onClick";g.trigger(j,[m])});p=m;l.removeClass(d.current);q.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return l},getPanes:function(){return n},getCurrentPane:function(){return n.eq(p)},getCurrentTab:function(){return l.eq(p)},getIndex:function(){return p},next:function(){return f.click(p+1)},prev:function(){return f.click(p-1)},destroy:function(){l.unbind(d.event).removeClass(d.current);
n.find("a[href^=#]").unbind("click.T");return f}});a.each("onBeforeClick,onClick".split(","),function(m,j){a.isFunction(d[j])&&a(f).bind(j,d[j]);f[j]=function(q){a(f).bind(j,q);return f}});if(d.history&&a.fn.history){a.tools.history.init(l);d.event="history"}l.each(function(m){a(this).bind(d.event,function(j){f.click(m,j);return j.preventDefault()})});n.find("a[href^=#]").bind("click.T",function(m){f.click(a(this).attr("href"),m)});if(location.hash)f.click(location.hash);else if(d.initialIndex===
0||d.initialIndex>0)f.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,c){h[b]=c}};var h={"default":function(b,c){this.getPanes().hide().eq(b).show();c.call()},fade:function(b,c){var d=this.getConf(),f=d.fadeOutSpeed,g=this.getPanes();f?g.fadeOut(f):g.hide();g.eq(b).fadeIn(d.fadeInSpeed,c)},slide:function(b,c){this.getPanes().slideUp(200);
this.getPanes().eq(b).slideDown(400,c)},ajax:function(b,c){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),c)}},e;a.tools.tabs.addEffect("horizontal",function(b,c){e||(e=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(b).animate({width:e},function(){a(this).show();c.call()})});a.fn.tabs=function(b,c){var d=this.data("tabs");if(d){d.destroy();this.removeData("tabs")}if(a.isFunction(c))c={onBeforeClick:c};c=a.extend({},
a.tools.tabs.conf,c);this.each(function(){d=new i(a(this),b,c);a(this).data("tabs",d)});return c.api?d:this}})(jQuery);
(function(a){function i(b,c,d){var f=d.relative?b.position().top:b.offset().top,g=d.relative?b.position().left:b.offset().left,l=d.position[0];f-=c.outerHeight()-d.offset[0];g+=b.outerWidth()+d.offset[1];var n=c.outerHeight()+b.outerHeight();if(l=="center")f+=n/2;if(l=="bottom")f+=n;l=d.position[1];b=c.outerWidth()+b.outerWidth();if(l=="center")g-=b/2;if(l=="left")g-=b;return{top:f,left:g}}function h(b,c){var d=this,f=b.add(d),g,l=0,n=0,p=b.attr("title"),m=e[c.effect],j,q=b.is(":input"),s=q&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=c.events[u]||c.events[q?s?"widget":"input":"def"];if(!m)throw'Nonexistent effect "'+c.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(k){clearTimeout(l);if(c.predelay)n=setTimeout(function(){d.show(k)},c.predelay);else d.show(k)}).bind(r[1],function(k){clearTimeout(n);if(c.delay)l=setTimeout(function(){d.hide(k)},c.delay);else d.hide(k)});if(p&&c.cancelDefault){b.removeAttr("title");b.data("title",p)}a.extend(d,{show:function(k){if(!g){if(p)g=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(p);else if(c.tip)g=a(c.tip).eq(0);else{g=b.next();g.length||(g=b.parent().next())}if(!g.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;g.stop(true,true);var o=i(b,g,c);k=k||a.Event();k.type="onBeforeShow";f.trigger(k,[o]);if(k.isDefaultPrevented())return d;o=i(b,g,c);g.css({position:"absolute",top:o.top,left:o.left});j=true;m[0].call(d,function(){k.type="onShow";j="full";f.trigger(k)});o=c.events.tooltip.split(/,\s*/);
g.bind(o[0],function(){clearTimeout(l);clearTimeout(n)});o[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&g.bind(o[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(k){if(!g||!d.isShown())return d;k=k||a.Event();k.type="onBeforeHide";f.trigger(k);if(!k.isDefaultPrevented()){j=false;e[c.effect][1].call(d,function(){k.type="onHide";j=false;f.trigger(k)});return d}},isShown:function(k){return k?j=="full":j},getConf:function(){return c},getTip:function(){return g},
getTrigger:function(){return b}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(k,o){a.isFunction(c[o])&&a(d).bind(o,c[o]);d[o]=function(t){a(d).bind(o,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,c,d){e[b]=[c,d]}};var e={toggle:[function(b){var c=this.getConf(),d=this.getTip();c=c.opacity;c<1&&d.css({opacity:c});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(true,{},a.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){c=new h(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,i){var h=i.schema={init_row_menu:function(e){a(".row-menu-trigger",e).each(function(){var b=a(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(h.row_menu_hoverover,h.row_menu_hoverout)})},row_menu_hoverover:function(){var e=a(this);e.addClass("row-hover");a(".row-menu-trigger",e).css("visibility","visible")},row_menu_hoverout:function(){var e=a(this);a(".row-menu-trigger",e).css("visibility","hidden");
e.removeClass("row-hover")},close_message:function(e,b){var c=a(this).parents(b);c.is("tr")?c.hideRow(function(){c.remove()}):c.slideUp(function(){c.remove()});return false},init_modal_help:function(e){a(".modal-help-toggle",e).click(function(){var b=a(this),c=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(c.is(":hidden")){c.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{c.slideUp();b.html("[ + ] Show Help")}})}};a(function(){a.tablesorter.addParser({id:"schemaName",
is:function(){return false},format:function(d){return a(d).text().toLowerCase()},type:"text"});a.tablesorter.addParser({id:"commaDigit",is:function(){return false},format:function(d){return parseInt(d.replace(/\,/g,""))},type:"numeric"});a.tablesorter.defaults.cssAsc="column-header-asc";a.tablesorter.defaults.cssDesc="column-header-desc";a.tablesorter.defaults.cssHeader="column-header";h.init_row_menu();a(".blurb-trigger").click(function(){var d=a(this),f=d.siblings(".blurb"),g=d.siblings(".blob");
if(g.is(":hidden")){g.show();f.hide();d.text("Less")}else{g.hide();f.show();d.text("More")}});var e=a(".breadcrumb-sibling-trigger").outerWidth();a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-e],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}});e=a("#language-select").change(function(){var d=a(this).val();a.cookie("lang",d,{path:"/"});window.location.reload(true)});
var b,c;a("option",e).each(function(){var d=a(this);if(d.val()==="/lang/en")b=d;if(d.val()===i.acre.lang.mql){c=d.attr("selected","selected");return false}});!c&&b&&b.attr("selected","selected")})})(jQuery,window.freebase);
(function(a,i){var h=i.schema.domain={init:function(){h.init_tablesorter();h.init_toggle_help_messages()},init_tablesorter:function(){a(".table-sortable").each(function(){var e=a(this);if(a("> tbody > tr",e).length){e.tablesorter();a("thead th:nth-child(2)",e)[0].count=1;a("thead th:nth-child(3)",e)[0].count=1;a("thead th:nth-child(4)",e)[0].count=1}})},init_toggle_help_messages:function(){a(".table-empty-trigger").click(function(){var e=a(this).parents(".table-empty-msg"),b=e.find(".table-empty-text");
if(b.is(":hidden")){e.addClass("active");b.slideDown()}else{e.removeClass("active");b.slideUp()}})},init_edit:function(){a(".edit").show();var e=a("table.table");e.first().find(".table-empty-msg").addClass("active").find(".table-empty-text").slideDown();e.find("tbody > tr").length===0?a(".table-title > .help-link").hide():a(".table-empty-msg").hide()},domain_settings:function(e,b){var c=a(this);i.get_script(i.acre.request.app_url+"/schema/MANIFEST/domain-edit.mf.js",function(){h.edit.domain_settings_begin(c,
b)});return false},add_type:function(e,b,c){var d=a(this);if(d.is(".editing"))return false;d.addClass("editing");i.get_script(i.acre.request.app_url+"/schema/MANIFEST/domain-edit.mf.js",function(){h.edit.add_type_begin(d,b,c)});return false},delete_type:function(e,b){var c=a(this);if(c.is(".editing"))return false;c.addClass("editing");c.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();i.get_script(i.acre.request.app_url+"/schema/MANIFEST/domain-edit.mf.js",function(){h.edit.delete_type_begin(c,
b)});return false},undo_delete_type:function(){var e=a(this);if(e.is(".editing"))return false;e.addClass("editing");var b=e.metadata();i.get_script(i.acre.request.app_url+"/schema/MANIFEST/domain-edit.mf.js",function(){h.edit.undo_delete_type_begin(e,b)});return false},edit_type:function(e,b){var c=a(this);if(c.is(".editing"))return false;c.addClass("editing");c.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();i.get_script(i.acre.request.app_url+"/schema/MANIFEST/domain-edit.mf.js",
function(){h.edit.edit_type_begin(c,b)});return false}};a(window).bind("fb.permission.has_permission",function(e,b){b&&h.init_edit()});a(h.init)})(jQuery,window.freebase);
