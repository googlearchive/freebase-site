
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
 
 jQuery Tools @VERSION Tooltip - UI essentials

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tooltip/

 Since: November 2008
 Date: @DATE 
*/
(function(c){c.fn.collapse_module=function(m){var n=c(m);m=c(this);var e=m.get(0),d=c(".trigger:first",e),f=c(".module-section",e),g=m.slice(1),o=n.css("margin-left");d.click(function(){if(d.hasClass("collapsed"))n.animate({marginLeft:o},function(){f.slideDown(function(){d.removeClass("collapsed")});g.fadeIn()});else{g.fadeOut();f.slideUp(function(){n.animate({marginLeft:0});d.addClass("collapsed")})}return false})}})(jQuery);
(function(c){function m(d,f,g){var o=g.relative?d.position().top:d.offset().top,i=g.relative?d.position().left:d.offset().left,p=g.position[0];o-=f.outerHeight()-g.offset[0];i+=d.outerWidth()+g.offset[1];var q=f.outerHeight()+d.outerHeight();if(p=="center")o+=q/2;if(p=="bottom")o+=q;p=g.position[1];d=f.outerWidth()+d.outerWidth();if(p=="center")i-=d/2;if(p=="left")i-=d;return{top:o,left:i}}function n(d,f){var g=this,o=d.add(g),i,p=0,q=0,v=d.attr("title"),w=e[f.effect],s,x=d.is(":input"),r=x&&d.is(":checkbox, :radio, select, :button, :submit"),
u=d.attr("type"),t=f.events[u]||f.events[x?r?"widget":"input":"def"];if(!w)throw'Nonexistent effect "'+f.effect+'"';t=t.split(/,\s*/);if(t.length!=2)throw"Tooltip: bad events configuration for "+u;d.bind(t[0],function(k){clearTimeout(p);if(f.predelay)q=setTimeout(function(){g.show(k)},f.predelay);else g.show(k)}).bind(t[1],function(k){clearTimeout(q);if(f.delay)p=setTimeout(function(){g.hide(k)},f.delay);else g.hide(k)});if(v&&f.cancelDefault){d.removeAttr("title");d.data("title",v)}c.extend(g,{show:function(k){if(!i){if(v)i=
c(f.layout).addClass(f.tipClass).appendTo(document.body).hide().append(v);else if(f.tip)i=c(f.tip).eq(0);else{i=d.next();i.length||(i=d.parent().next())}if(!i.length)throw"Cannot find tooltip for "+d;}if(g.isShown())return g;i.stop(true,true);var l=m(d,i,f);k=k||c.Event();k.type="onBeforeShow";o.trigger(k,[l]);if(k.isDefaultPrevented())return g;l=m(d,i,f);i.css({position:"absolute",top:l.top,left:l.left});s=true;w[0].call(g,function(){k.type="onShow";s="full";o.trigger(k)});l=f.events.tooltip.split(/,\s*/);
i.bind(l[0],function(){clearTimeout(p);clearTimeout(q)});l[1]&&!d.is("input:not(:checkbox, :radio), textarea")&&i.bind(l[1],function(z){z.relatedTarget!=d[0]&&d.trigger(t[1].split(" ")[0])});return g},hide:function(k){if(!i||!g.isShown())return g;k=k||c.Event();k.type="onBeforeHide";o.trigger(k);if(!k.isDefaultPrevented()){s=false;e[f.effect][1].call(g,function(){k.type="onHide";s=false;o.trigger(k)});return g}},isShown:function(k){return k?s=="full":s},getConf:function(){return f},getTip:function(){return i},
getTrigger:function(){return d}});c.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(k,l){c.isFunction(f[l])&&c(g).bind(l,f[l]);g[l]=function(z){c(g).bind(l,z);return g}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(d,f,g){e[d]=[f,g]}};var e={toggle:[function(d){var f=this.getConf(),g=this.getTip();f=f.opacity;f<1&&g.css({opacity:f});g.show();d.call()},function(d){this.getTip().hide();d.call()}],fade:[function(d){var f=this.getConf();this.getTip().fadeTo(f.fadeInSpeed,f.opacity,d)},function(d){this.getTip().fadeOut(this.getConf().fadeOutSpeed,d)}]};c.fn.tooltip=function(d){var f=this.data("tooltip");if(f)return f;d=c.extend(true,{},c.tools.tooltip.conf,d);
if(typeof d.position=="string")d.position=d.position.split(/,?\s/);this.each(function(){f=new n(c(this),d);c(this).data("tooltip",f)});return d.api?f:this}})(jQuery);
(function(c,m){function n(e){c(".kbs.current",e).removeClass("current");var d=c(".domain-section:first",e),f=c(".domain-section:last",e),g=this.get_current=function(){return c(".kbs.current:first",e)},o;o=typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,
h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}};var i=this.set_next=function(a,b,h){if(b.length){a.removeClass("current");b.addClass("current");if(!h){a=c(document).scrollTop();c(document).height();h=o().h;h=a+h;var j=b.offset().top;b=j+b.height();if(j<a)c(document).scrollTop(j);else b>h&&c(document).scrollTop(j)}}},p=this.next_domain=function(a){var b=g(),h=q(b);if(h){h=h.find(".kbs:first");
i(b,h,a)}},q=this._next_domain=function(a){if(!(a&&a.length))return c(".domain-section:first",e);a=a.closest(".domain-section");return!a.length||a[0]===f[0]?d:a.next(".domain-section")},v=this.prev_domain=function(){var a=g(),b=w(a);if(b){b=b.find(".kbs:first");i(a,b)}},w=this._prev_domain=function(a){if(!(a&&a.length))return c(".domain-section:last",e);var b=a.closest(".domain-section");if(a.closest(".property-section").length||a.closest(".type-section").length)return b;return!b.length||b[0]===d[0]?
f:b.prev(".domain-section")},s=this.next_type=function(){var a=g(),b=x(a);if(b){b=b.find(".kbs:first");i(a,b)}},x=this._next_type=function(a){if(!(a&&a.length))return c(".type-section:first",e);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var h=q(b);if(h)for(;h.get(0)!==b.get(0);){a=h.find(".type-section:first");if(a.length)break;h=q(h)}}return a},r=this.prev_type=function(){var a=g(),b=u(a);if(b){b=
b.find(".kbs:first");i(a,b)}},u=this._prev_type=function(a){if(!(a&&a.length))return c(".type-section:last",e);var b=a.closest(".domain-section"),h=a.closest(".type-section");if(a.closest(".property-section").length)return h;var j;if(h.length)j=h.prev(".type-section");if(!(j&&j.length))if(a=w(b))for(;a.get(0)!==b.get(0);){j=a.find(".type-section:last");if(j.length)break;a=w(a)}return j},t=this.next_prop=function(){var a=g(),b=k(a);if(b){b=b.find(".kbs:first");i(a,b)}},k=this._next_prop=function(a){if(!(a&&
a.length))return c(".property-section:first",e);var b=a.closest(".domain-section"),h=a.closest(".type-section"),j=a.closest(".property-section");b=j.length?j.next(".property-section"):h.length?h.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=x(a))for(;a.get(0)!==h.get(0);){b=a.find(".property-section:first");if(b.length)break;if(h.get(0)==null)h=a;a=x(a)}return b},l=this.prev_prop=function(){var a=g(),b=z(a);if(b){b=b.find(".kbs:first");i(a,b)}},z=this._prev_prop=
function(a){if(!(a&&a.length))return c(".property-section:last",e);var b=a.closest(".domain-section"),h=a.closest(".type-section"),j=a.closest(".property-section");if(a.closest(".list-section").length)return j;var y;if(j.length)y=j.prev(".property-section");if(!(y&&y.length))if(r=h.length?u(h):u(b))for(;r.get(0)!==h.get(0);){y=r.find(".property-section:last");if(y.length)break;if(h.get(0)==null)h=r;r=u(r)}return y};this.next=function(){var a=g(),b=this._next(a);b&&i(a,b)};this._next=function(a){if(!(a&&
a.length))return c(".domain-section:first .kbs:first",e);var b=a.closest(".domain-section"),h=a.closest(".type-section"),j=a.closest(".property-section");if(a.closest(".list-section").length){a=a.next(".kbs");if(a.length)return a;a=j.next(".property-section").find(".kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else if(j.length){a=j.find(".list-section:first .kbs:first");if(a.length)return a;a=j.next(".property-section").find(".kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else if(h.length){a=
h.find(".property-section:first .kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===f.get(0)?d.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=g(),b=this._prev(a);b&&i(a,b)};this._prev=function(a){if(!(a&&a.length)){a=c(".list-section:last .kbs:last",e);a.length||(a=c(".property-section:last .kbs:first",e));a.length||(a=c(".type-section:last .kbs:first",
e));a.length||(a=c(".domain-section:last .kbs:first",e));return a}var b=a.closest(".domain-section"),h=a.closest(".type-section"),j=a.closest(".property-section");if(a.closest(".list-section").length){a=a.prev(".kbs");if(a.length)return a;return j.find(".kbs:first")}else if(j.length){a=j.prev(".property-section").find(".kbs:last");if(a.length)return a;return h.find(".kbs:first")}else if(h.length){a=h.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===
d.get(0)?f.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var A=this;c(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==c("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?v():p();else if(b===84)a.shiftKey?r():s();else if(b===80)a.shiftKey?l():t();else if(b===74)A.next();else if(b===75)A.prev();else b===69&&A.edit()}})}m.kbs={init:function(e){return new n(e)}}})(jQuery,
window.freebase);
(function(c,m){var n=m.topic={init_row_menu:function(e){c(".menu-trigger",e).each(function(){var d=c(".row-menu:first").outerWidth();c(this).tooltip({events:{def:"click,mouseout"},relative:true,position:["bottom","right"],offset:[0,"-"+d],effect:"fade",delay:300})})},row_menu_hoverover:function(){var e=c(this);n.row_menu_hoverover.timeout=setTimeout(function(){e.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(n.row_menu_hoverover.timeout);c(this).removeClass("row-hover")},init:function(){var e=
m.kbs.init("#topic-data");e.next_domain(true);c("#topic-data .kbs").live("click",function(){var d=e.get_current();e.set_next(d,c(this),true)}).live("edit",function(){c(this).find(".row-menu-item:first a").click()}).hover(n.row_menu_hoverover,n.row_menu_hoverout);n.init_row_menu("#topic-data");c(".combo-menu .default-action").live("click",function(){c(this).parents(".kbs:first").trigger("edit")});c(".column.nav > .module").collapse_module(".section");m.filters.init_domain_type_property_filter(".column.nav");
m.filters.init_limit_slider_filter("#limit-slider",10,1,100,1);c(".toolbar-trigger").click(function(){var d=c(".add-type").first(),f=c(this).closest(".toolbar"),g=c(this);if(d.is(":visible")){f.removeClass("active");g.removeClass("active");d.slideUp()}else{g.addClass("active");f.addClass("active");d.slideDown()}});c(".fb-input").focusin(function(){c(this).parents(".data-input").addClass("focus")});c(".fb-input").focusout(function(){c(this).parents(".data-input").removeClass("focus")})},prop_edit:function(){var e=
c(this).parents(".row-menu:first").prev(".menu-trigger");e.data("tooltip").hide();e=e.parents(".property-section").attr("data-id");console.log("prop_edit",e);return false},prop_add:function(){var e=c(this).parents(".row-menu:first").prev(".menu-trigger");e.data("tooltip").hide();e=e.parents(".property-section").attr("data-id");console.log("prop_add",e);return false},value_edit:function(){var e=c(this).parents(".row-menu:first").prev(".menu-trigger");e.data("tooltip").hide();e=e.parents(".combo-menu:first").prev(".property-value");
var d=e.parents(".kbs:first");d.is("tr")?console.log("value_edit CVT",d.attr("data-id")):console.log("value_edit",e.attr("data-id")||e.attr("data-value"));return false},value_delete:function(){var e=c(this).parents(".row-menu:first").prev(".menu-trigger");e.data("tooltip").hide();e=e.parents(".combo-menu:first").prev(".property-value");var d=e.parents(".kbs:first");d.is("tr")?console.log("value_delete CVT",d.attr("data-id")):console.log("value_delete",e.attr("data-id")||e.attr("data-value"));return false}};
c(n.init)})(jQuery,window.freebase);
