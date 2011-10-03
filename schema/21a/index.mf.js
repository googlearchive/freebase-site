
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
(function(a){a.fn.showRow=function(j,n,g){n=n==="fadeIn"?"fadeIn":"slideDown";var b=this;return this.each(function(){var c=a(this).hide(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');d=a(".wrapInner",d).hide();c.show();d[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});j&&j.call(b)})})};a.fn.hideRow=function(j,n,g){n=n==="fadeOut"?"fadeOut":"slideUp";var b=this;return this.each(function(){var c=a(this).show(),d=a("> td, > th",c).wrapInner('<div class="wrapInner" style="display: block;">');
a(".wrapInner",d)[n](g,function(){a(this).each(function(){a(this).replaceWith(a(this).contents())});c.hide();j&&j.call(b)})})}})(jQuery);
(function(a){function j(b,c,d){var f=this,h=b.add(this),k=b.find(d.tabs),o=c.jquery?c:b.children(c),i;k.length||(k=b.children());o.length||(o=b.parent().find(c));o.length||(o=a(c));a.extend(this,{click:function(e,l){var q=k.eq(e);if(typeof e=="string"&&e.replace("#","")){e=e.replace(/([\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,"\\$1");q=k.filter("[href*="+e.replace("#","")+"]");e=Math.max(k.index(q),0)}if(d.rotate){var s=k.length-1;if(e<0)return f.click(s,l);if(e>s)return f.click(0,
l)}if(!q.length){if(i>=0)return f;e=d.initialIndex;q=k.eq(e)}if(e===i)return f;l=l||a.Event();l.type="onBeforeClick";h.trigger(l,[e]);if(!l.isDefaultPrevented()){n[d.effect].call(f,e,function(){l.type="onClick";h.trigger(l,[e])});i=e;k.removeClass(d.current);q.addClass(d.current);return f}},getConf:function(){return d},getTabs:function(){return k},getPanes:function(){return o},getCurrentPane:function(){return o.eq(i)},getCurrentTab:function(){return k.eq(i)},getIndex:function(){return i},next:function(){return f.click(i+
1)},prev:function(){return f.click(i-1)},destroy:function(){k.unbind(d.event).removeClass(d.current);o.find("a[href^=#]").unbind("click.T");return f}});a.each("onBeforeClick,onClick".split(","),function(e,l){a.isFunction(d[l])&&a(f).bind(l,d[l]);f[l]=function(q){a(f).bind(l,q);return f}});if(d.history&&a.fn.history){a.tools.history.init(k);d.event="history"}k.each(function(e){a(this).bind(d.event,function(l){f.click(e,l);return l.preventDefault()})});o.find("a[href^=#]").bind("click.T",function(e){f.click(a(this).attr("href"),
e)});if(location.hash)f.click(location.hash);else if(d.initialIndex===0||d.initialIndex>0)f.click(d.initialIndex)}a.tools=a.tools||{version:"@VERSION"};a.tools.tabs={conf:{tabs:"a",current:"current",onBeforeClick:null,onClick:null,effect:"default",initialIndex:0,event:"click",rotate:false,history:false},addEffect:function(b,c){n[b]=c}};var n={"default":function(b,c){this.getPanes().hide().eq(b).show();c.call()},fade:function(b,c){var d=this.getConf(),f=d.fadeOutSpeed,h=this.getPanes();f?h.fadeOut(f):
h.hide();h.eq(b).fadeIn(d.fadeInSpeed,c)},slide:function(b,c){this.getPanes().slideUp(200);this.getPanes().eq(b).slideDown(400,c)},ajax:function(b,c){this.getPanes().eq(0).load(this.getTabs().eq(b).attr("href"),c)}},g;a.tools.tabs.addEffect("horizontal",function(b,c){g||(g=this.getPanes().eq(0).width());this.getCurrentPane().animate({width:0},function(){a(this).hide()});this.getPanes().eq(b).animate({width:g},function(){a(this).show();c.call()})});a.fn.tabs=function(b,c){var d=this.data("tabs");if(d){d.destroy();
this.removeData("tabs")}if(a.isFunction(c))c={onBeforeClick:c};c=a.extend({},a.tools.tabs.conf,c);this.each(function(){d=new j(a(this),b,c);a(this).data("tabs",d)});return c.api?d:this}})(jQuery);
(function(a){function j(b,c,d){var f=d.relative?b.position().top:b.offset().top,h=d.relative?b.position().left:b.offset().left,k=d.position[0];f-=c.outerHeight()-d.offset[0];h+=b.outerWidth()+d.offset[1];var o=c.outerHeight()+b.outerHeight();if(k=="center")f+=o/2;if(k=="bottom")f+=o;k=d.position[1];b=c.outerWidth()+b.outerWidth();if(k=="center")h-=b/2;if(k=="left")h-=b;return{top:f,left:h}}function n(b,c){var d=this,f=b.add(d),h,k=0,o=0,i=b.attr("title"),e=g[c.effect],l,q=b.is(":input"),s=q&&b.is(":checkbox, :radio, select, :button, :submit"),
u=b.attr("type"),r=c.events[u]||c.events[q?s?"widget":"input":"def"];if(!e)throw'Nonexistent effect "'+c.effect+'"';r=r.split(/,\s*/);if(r.length!=2)throw"Tooltip: bad events configuration for "+u;b.bind(r[0],function(m){clearTimeout(k);if(c.predelay)o=setTimeout(function(){d.show(m)},c.predelay);else d.show(m)}).bind(r[1],function(m){clearTimeout(o);if(c.delay)k=setTimeout(function(){d.hide(m)},c.delay);else d.hide(m)});if(i&&c.cancelDefault){b.removeAttr("title");b.data("title",i)}a.extend(d,{show:function(m){if(!h){if(i)h=
a(c.layout).addClass(c.tipClass).appendTo(document.body).hide().append(i);else if(c.tip)h=a(c.tip).eq(0);else{h=b.next();h.length||(h=b.parent().next())}if(!h.length)throw"Cannot find tooltip for "+b;}if(d.isShown())return d;h.stop(true,true);var p=j(b,h,c);m=m||a.Event();m.type="onBeforeShow";f.trigger(m,[p]);if(m.isDefaultPrevented())return d;p=j(b,h,c);h.css({position:"absolute",top:p.top,left:p.left});l=true;e[0].call(d,function(){m.type="onShow";l="full";f.trigger(m)});p=c.events.tooltip.split(/,\s*/);
h.bind(p[0],function(){clearTimeout(k);clearTimeout(o)});p[1]&&!b.is("input:not(:checkbox, :radio), textarea")&&h.bind(p[1],function(t){t.relatedTarget!=b[0]&&b.trigger(r[1].split(" ")[0])});return d},hide:function(m){if(!h||!d.isShown())return d;m=m||a.Event();m.type="onBeforeHide";f.trigger(m);if(!m.isDefaultPrevented()){l=false;g[c.effect][1].call(d,function(){m.type="onHide";l=false;f.trigger(m)});return d}},isShown:function(m){return m?l=="full":l},getConf:function(){return c},getTip:function(){return h},
getTrigger:function(){return b}});a.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(m,p){a.isFunction(c[p])&&a(d).bind(p,c[p]);d[p]=function(t){a(d).bind(p,t);return d}})}a.tools=a.tools||{version:"@VERSION"};a.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,c,d){g[b]=[c,d]}};var g={toggle:[function(b){var c=this.getConf(),d=this.getTip();c=c.opacity;c<1&&d.css({opacity:c});d.show();b.call()},function(b){this.getTip().hide();b.call()}],fade:[function(b){var c=this.getConf();this.getTip().fadeTo(c.fadeInSpeed,c.opacity,b)},function(b){this.getTip().fadeOut(this.getConf().fadeOutSpeed,b)}]};a.fn.tooltip=function(b){var c=this.data("tooltip");if(c)return c;b=a.extend(true,{},a.tools.tooltip.conf,b);
if(typeof b.position=="string")b.position=b.position.split(/,?\s/);this.each(function(){c=new n(a(this),b);a(this).data("tooltip",c)});return b.api?c:this}})(jQuery);
(function(a,j){var n=j.schema={init_row_menu:function(g){a(".row-menu-trigger",g).each(function(){var b=a(this);b.tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-10,-10],effect:"fade",delay:300});b.parents("tr:first").hover(n.row_menu_hoverover,n.row_menu_hoverout)})},row_menu_hoverover:function(){var g=a(this);g.addClass("row-hover");a(".row-menu-trigger",g).css("visibility","visible")},row_menu_hoverout:function(){var g=a(this);a(".row-menu-trigger",g).css("visibility","hidden");
g.removeClass("row-hover")},close_message:function(g,b){var c=a(this).parents(b);c.is("tr")?c.hideRow(function(){c.remove()}):c.slideUp(function(){c.remove()});return false},init_modal_help:function(g){a(".modal-help-toggle",g).click(function(){var b=a(this),c=b.parents().find(".modal-help"),d=b.parents().find(".modal-content");if(c.is(":hidden")){c.height(d.height()-5).slideDown();b.html("[ - ] Hide Help")}else{c.slideUp();b.html("[ + ] Show Help")}})}};a(function(){n.init_row_menu();var g=a(".breadcrumb-sibling-trigger").outerWidth();
a(".breadcrumb-sibling-trigger").tooltip({events:{def:"click,mouseout"},position:"bottom right",offset:[-5,-g],effect:"fade",delay:300,onBeforeShow:function(){this.getTrigger().addClass("active")},onHide:function(){this.getTrigger().removeClass("active")}})})})(jQuery,window.freebase);
(function(a,j){j.schema.index={add_domain:function(){j.schema.index._add_domain(a(this))},_add_domain:function(g){j.get_script(j.h.static_url("index-edit.mf.js"),function(){j.schema.index.edit.add_domain_begin(g)});return false}};var n;if(j.user){n=a("#create-new-domain").show();window.location.hash=="#create"&&setTimeout(function(){j.schema.index._add_domain(n)},0)}else a(window).bind("fb.user.signedin",function(){n=a("#create-new-domain").show();window.location.hash=="#create"&&setTimeout(function(){j.schema.index._add_domain(n)},
0)});a(function(){var g=a(".table-sortable");a("thead th:nth-child(2)",g)[0].count=1;a("thead th:nth-child(3)",g)[0].count=1;a("thead th:nth-child(4)",g)[0].count=1;a("#schema-search > .section-tabset").tabs("#schema-search > .search-box",{initialIndex:1,api:true});var b={domain:function(){var i=j.suggest_options.any("/type/domain");if(a("#domain-search-toggle-commons").is(":checked"))i.mql_filter=[{key:[{namespace:"/"}]}];return i},type:function(){var i=j.suggest_options.any("/type/type");if(a("#type-search-toggle-commons").is(":checked"))i.mql_filter=
[{"/type/type/domain":[{key:[{namespace:"/"}]}]}];return i},property:function(){var i=j.suggest_options.any("/type/property");if(a("#property-search-toggle-commons").is(":checked"))i.mql_filter=[{"/type/property/schema":{"/type/type/domain":[{key:[{namespace:"/"}]}]}}];return i}},c=a("#domain-search-input"),d=c.closest("form");d.submit(function(){return false});c.suggest(b.domain()).bind("fb-select",function(i,e){window.location.href=j.h.fb_url(e.id,[["schema"]])}).focus(function(){this.select()});
var f=a("#type-search-input"),h=f.closest("form");h.submit(function(){return false});f.suggest(b.type()).bind("fb-select",function(i,e){window.location.href=j.h.fb_url(e.id,[["schema"]])}).focus(function(){this.select()});var k=a("#property-search-input"),o=k.closest("form");o.submit(function(){return false});k.suggest(b.property()).bind("fb-select",function(i,e){window.location.href=j.h.fb_url(e.id,[["schema"]])}).focus(function(){this.select()});a(".search-toggle").click(function(){var i=a(this),
e=a(this).parent().siblings("form");i.attr("id").split("-");if(e.attr("id")===d.attr("id"))c.suggest(b.domain());else if(e.attr("id")===h.attr("id"))f.suggest(b.type());else e.attr("id")===o.attr("id")&&k.suggest(b.property());i=e.find(".text-input");e=i.val();i.val(e).focus().trigger(jQuery.Event("keyup"))})})})(jQuery,window.freebase);
