
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
(function(a){a.fn.showRow=function(i,n,h){n=n==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var c=a(this).hide(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();c.show();d[n](h,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});i&&i.call(b)})})};a.fn.hideRow=function(i,n,h){n=n==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var c=a(this).show(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[n](h,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c.hide();i&&i.call(b)})})}})(jQuery);
(function(a){function i(b,c,d){var e=this,f=b.add(this),k=b.find(d.tabs),o=c.jquery?c:b.children(c),q;k.length||(k=b.children());o.length||(o=b.parent().find(c));o.length||(o=a(c));a.extend(this,{click:function(j,g){var l=k.eq(j);if(typeof j=="string"&&j.replace("#","")){j=j.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");l=k.filter("[href*="+j.replace("#","")+"]");j=Math.max(k.index(l),0)}if(d.rotate){var p=k.length-1;if(j<0)return e.click(p,g);if(j>p)return e.click(0,
g)}if(!l.length){if(q>=0)return e;j=d.initialIndex;l=k.eq(j)}if(j===q)return e;g=g||a.Event();g.type="onBeforeClick";f.trigger(g,[j]);if(!g.isDefaultPrevented()){n[d.effect].call(e,j,function(){g.type="onClick";f.trigger(g,[j])});q=j;k.removeClass(d.current);l.addClass(d.current);return e}},getConf:function(){return d},getTabs:function(){return k},getPanes:function(){return o},getCurrentPane:function(){return o.eq(q)},getCurrentTab:function(){return k.eq(q)},getIndex:function(){return q},next:function(){return e.click(q+
1)},prev:function(){return e.click(q-1)},destroy:function(){k.unbind(d.event).removeClass(d.current);o.find("a[href^=#]").unbind("click.T");return e}});a.each("onBeforeClick,onClick".split(","),function(j,g){a.isFunction(d[g])&&a(e).bind(g,d[g]);e[g]=function(l){a(e).bind(g,l);return e}});if(d.history&&a.fn.history){a.tools.history.init(k);d.event="history"}k.each(function(j){a(this).bind(d.event,function(g){e.click(j,g);return g.preventDefault()})});o.find("a[href^=#]").bind("click.T",function(j){e.click(a(this).attr("href"),
j)});if(location.hash)e.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)e.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,c){n[b]=c}};var n={"default":function(b,c){this.getPanes().hide().eq(b).show();c.call()},fade:function(b,c){var d=this.getConf(),e=d.fadeOutSpeed,f=this.getPanes();e?f.fadeOut(e):
f.hide();f.eq(b).fadeIn(d.fadeInSpeed,c)},slide:function(b,c){this.getPanes().slideUp(200);this.getPanes().eq(b).slideDown(400,c)},ajax:function(b,c){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),c)}},h;a.tools.tabs.addEffect("horizontal",function(b,c){h||(h=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(b).animate({width:h},function(){a(this).show();c.call()})});a.fn.tabs=function(b,c){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(a.isFunction(c))c={onBeforeClick:c};c=a.extend({},a.tools.tabs.conf,c);this.each(function(){d=new i(a(this),b,c);a(this).data("tabs",d)});return c.api?d:this}})(jQuery);
(function(a){function i(b,c,d){var e=d.relative?b.position().top:b.offset().top,f=d.relative?b.position().left:b.offset().left,k=d.position[0];e-=c.outerHeight()-d.offset[0];f+=b.outerWidth()+d.offset[1];var o=c.outerHeight()+b.outerHeight();if(k=="center")e+=o/2;if(k=="bottom")e+=o;k=d.position[1];b=c.outerWidth()+b.outerWidth();if(k=="center")f-=b/2;if(k=="left")f-=b;return{top:e,left:f}}function n(b,c){var d=this,e=b.add(d),f,k=0,o=0,q=b.attr("title"),j=h[c.effect],g,l=b.is(":input"),p=l&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),s=c.events[u]||c.events[l?p?"widget":"input":"def"];if(!j)throw'Nonexistent effect "'+c.effect+'"';s=s.split(/,\s*/);if(s.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(s[0],function(m){clearTimeout(k);if(c.predelay)o=setTimeout(function(){d.show(m)},c.predelay);else d.show(m)}).bind(s[1],function(m){clearTimeout(o);if(c.delay)k=setTimeout(function(){d.hide(m)},c.delay);else d.hide(m)});if(q&&c.cancelDefault){b.removeAttr("title");b.data("title",q)}a.extend(d,{show:function(m){if(!f){if(q)f=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(q);else if(c.tip)f=a(c.tip).eq(0);else{f=b.next();f.length||(f=b.parent().next())}if(!f.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;f.stop(true,true);var r=i(b,f,c);m=m||a.Event();m.type="onBeforeShow";e.trigger(m,[r]);if(m.isDefaultPrevented())return d;r=i(b,f,c);f.css({position:"absolute",top:r.top,left:r.left});g=true;j[0].call(d,function(){m.type="onShow";g="full";e.trigger(m)});r=c.events.tooltip.split(/,\s*/);
f.bind(r[0],function(){clearTimeout(k);clearTimeout(o)});r[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&f.bind(r[1],function(t){t.relatedTarget!=b[0]&&b.trigger(s[1].split(" ")[0])});return d},hide:function(m){if(!f||!d.isShown())return d;m=m||a.Event();m.type="onBeforeHide";e.trigger(m);if(!m.isDefaultPrevented()){g=false;h[c.effect][1].call(d,function(){m.type="onHide";g=false;e.trigger(m)});return d}},isShown:function(m){return m?g=="full":g},getConf:function(){return c},getTip:function(){return f},
getTrigger:function(){return b}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(m,r){a.isFunction(c[r])&&a(d).bind(r,c[r]);d[r]=function(t){a(d).bind(r,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,c,d){h[b]=[c,d]}};var h={toggle:[function(b){var c=this.getConf(),d=this.getTip();c=c.opacity;c<1&&d.css({opacity:c});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(true,{},a.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){c=new n(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,i){var n=i.schema={init_row_menu:function(h){a(".row-menu-trigger",h).each(function(){var b=a(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(n.row_menu_hoverover,n.row_menu_hoverout)})},row_menu_hoverover:function(){var h=a(this);h.addClass("row-hover");a(".row-menu-trigger",h).css("visibility","visible")},row_menu_hoverout:function(){var h=a(this);a(".row-menu-trigger",h).css("visibility","hidden");
h.removeClass("row-hover")},close_message:function(h,b){var c=a(this).parents(b);c.is("tr")?c.hideRow(function(){c.remove()}):c.slideUp(function(){c.remove()});return false},init_modal_help:function(h){a(".modal-help-toggle",h).click(function(){var b=a(this),c=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(c.is(":hidden")){c.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{c.slideUp();b.html("[ + ] Show Help")}})}};a(function(){n.init_row_menu();var h=a(".breadcrumb-sibling-trigger").outerWidth();
a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-h],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
(function(a,i){i.schema.index={add_domain:function(){i.schema.index._add_domain(a(this))},_add_domain:function(h){i.get_script(i.h.static_url("index-edit.mf.js"),function(){i.schema.index.edit.add_domain_begin(h)});return false}};var n;if(i.user){n=a("#create-new-domain").show();window.location.hash=="#create"&&setTimeout(function(){i.schema.index._add_domain(n)},0)}else a(window).bind("fb.user.signedin",function(){n=a("#create-new-domain").show();window.location.hash=="#create"&&setTimeout(function(){i.schema.index._add_domain(n)},
0)});a(function(){var h=a(".table-sortable");a("thead th:nth-child(2)",h)[0].count=1;a("thead th:nth-child(3)",h)[0].count=1;a("thead th:nth-child(4)",h)[0].count=1;a("#schema-search > .section-tabset").tabs("#schema-search > .search-box",{initialIndex:1,api:true});var b={domain:[{key:[{namespace:"/"}]}],type:[{"/type/type/domain":[{key:[{namespace:"/"}]}],"a:/type/type/domain":{id:"/freebase",optional:"forbidden"}}],property:[{"/type/property/schema":{type:"/type/type",domain:[{key:[{namespace:"/"}]}],
"a:domain":{id:"/freebase",optional:"forbidden"}}}]},c=a("#domain-search-input"),d=c.closest("form");d.submit(function(){return false});var e={type:"/type/domain",service_url:i.h.legacy_fb_url()};if(a("#domain-search-toggle-commons").is(":checked"))e.mql_filter=b.domain;c.suggest(e).bind("fb-select",function(l,p){window.location.href=i.h.fb_url(p.id,[["schema"]])}).focus(function(){this.select()});var f=a("#type-search-input"),k=f.closest("form");k.submit(function(){return false});var o={type:"/type/type",
service_url:i.h.legacy_fb_url()};if(a("#type-search-toggle-commons").is(":checked"))o.mql_filter=b.type;f.suggest(o).bind("fb-select",function(l,p){window.location.href=i.h.fb_url(p.id,[["schema"]])}).focus(function(){this.select()});var q=a("#property-search-input"),j=q.closest("form");j.submit(function(){return false});var g={type:"/type/property",service_url:i.h.legacy_fb_url()};if(a("#property-search-toggle-commons").is(":checked"))g.mql_filter=b.property;q.suggest(g).bind("fb-select",function(l,
p){window.location.href=i.h.fb_url(p.id,[["schema"]])}).focus(function(){this.select()});a(".search-toggle").click(function(){var l=a(this),p=a(this).parent().siblings("form");l=l.attr("id").split("-");if(p.attr("id")===d.attr("id")){if(l[l.length-1]==="commons")e.mql_filter=b.domain;else delete e.mql_filter;c.suggest(e)}else if(p.attr("id")===k.attr("id")){if(l[l.length-1]==="commons")o.mql_filter=b.type;else delete o.mql_filter;f.suggest(o)}else if(p.attr("id")===j.attr("id")){if(l[l.length-1]===
"commons")g.mql_filter=b.property;else delete g.mql_filter;q.suggest(g)}p=p.find(".text-input");l=p.val();p.val(l).focus().trigger(jQuery.Event("keyup"))})})})(jQuery,window.freebase);
