
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
(function(d){function v(c,e,f){var m=f.relative?c.position().top:c.offset().top,l=f.relative?c.position().left:c.offset().left,o=f.position[0];m-=e.outerHeight()-f.offset[0];l+=c.outerWidth()+f.offset[1];var r=e.outerHeight()+c.outerHeight();if(o=="center")m+=r/2;if(o=="bottom")m+=r;o=f.position[1];c=e.outerWidth()+c.outerWidth();if(o=="center")l-=c/2;if(o=="left")l-=c;return{top:m,left:l}}function i(c,e){var f=this,m=c.add(f),l,o=0,r=0,s=c.attr("title"),y=g[e.effect],p,q=c.is(":input"),w=q&&c.is(":checkbox, :radio, select, :button, :submit"),
z=c.attr("type"),t=e.events[z]||e.events[q?w?"widget":"input":"def"];if(!y)throw'Nonexistent effect "'+e.effect+'"';t=t.split(/,\s*/);if(t.length!=2)throw"Tooltip: bad events configuration for "+z;c.bind(t[0],function(j){clearTimeout(o);if(e.predelay)r=setTimeout(function(){f.show(j)},e.predelay);else f.show(j)}).bind(t[1],function(j){clearTimeout(r);if(e.delay)o=setTimeout(function(){f.hide(j)},e.delay);else f.hide(j)});if(s&&e.cancelDefault){c.removeAttr("title");c.data("title",s)}d.extend(f,{show:function(j){if(!l){if(s)l=
d(e.layout).addClass(e.tipClass).appendTo(document.body).hide().append(s);else if(e.tip)l=d(e.tip).eq(0);else{l=c.next();l.length||(l=c.parent().next())}if(!l.length)throw"Cannot find tooltip for "+c;}if(f.isShown())return f;l.stop(true,true);var n=v(c,l,e);j=j||d.Event();j.type="onBeforeShow";m.trigger(j,[n]);if(j.isDefaultPrevented())return f;n=v(c,l,e);l.css({position:"absolute",top:n.top,left:n.left});p=true;y[0].call(f,function(){j.type="onShow";p="full";m.trigger(j)});n=e.events.tooltip.split(/,\s*/);
l.bind(n[0],function(){clearTimeout(o);clearTimeout(r)});n[1]&&!c.is("input:not(:checkbox, :radio), textarea")&&l.bind(n[1],function(u){u.relatedTarget!=c[0]&&c.trigger(t[1].split(" ")[0])});return f},hide:function(j){if(!l||!f.isShown())return f;j=j||d.Event();j.type="onBeforeHide";m.trigger(j);if(!j.isDefaultPrevented()){p=false;g[e.effect][1].call(f,function(){j.type="onHide";p=false;m.trigger(j)});return f}},isShown:function(j){return j?p=="full":p},getConf:function(){return e},getTip:function(){return l},
getTrigger:function(){return c}});d.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(j,n){d.isFunction(e[n])&&d(f).bind(n,e[n]);f[n]=function(u){d(f).bind(n,u);return f}})}d.tools=d.tools||{version:"@VERSION"};d.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(c,e,f){g[c]=[e,f]}};var g={toggle:[function(c){var e=this.getConf(),f=this.getTip();e=e.opacity;e<1&&f.css({opacity:e});f.show();c.call()},function(c){this.getTip().hide();c.call()}],fade:[function(c){var e=this.getConf();this.getTip().fadeTo(e.fadeInSpeed,e.opacity,c)},function(c){this.getTip().fadeOut(this.getConf().fadeOutSpeed,c)}]};d.fn.tooltip=function(c){var e=this.data("tooltip");if(e)return e;c=d.extend(true,{},d.tools.tooltip.conf,c);
if(typeof c.position=="string")c.position=c.position.split(/,?\s/);this.each(function(){e=new i(d(this),c);d(this).data("tooltip",e)});return c.api?e:this}})(jQuery);
(function(d){var v=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(i){d(".kbs.current",i).removeClass("current");var g=d(".domain-section:first",i),c=d(".domain-section:last",i),e=this.scroll_to=function(a){var b=d(document).scrollTop();d(document).height();var h=v().h;h=b+h;var k=a.offset().top;a=k+a.height();if(k<b)d(document).scrollTop(k);else a>h&&d(document).scrollTop(b+(a-h))},f=this.get_current=function(){return d(".kbs.current:first",i)},m=this.set_next=function(a,b,h){if(b.length){a.removeClass("current");b.addClass("current");h||e(b)}},
l=this.next_domain=function(a){var b=f(),h=o(b);if(h){h=h.find(".kbs:first");m(b,h,a)}},o=this._next_domain=function(a){if(!(a&&a.length))return d(".domain-section:first",i);a=a.closest(".domain-section");return!a.length||a[0]===c[0]?g:a.next(".domain-section")},r=this.prev_domain=function(){var a=f(),b=s(a);if(b){b=b.find(".kbs:first");m(a,b)}},s=this._prev_domain=function(a){if(!(a&&a.length))return d(".domain-section:last",i);var b=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return b;return!b.length||b[0]===g[0]?c:b.prev(".domain-section")},y=this.next_type=function(){var a=f(),b=p(a);if(b){b=b.find(".kbs:first");m(a,b)}},p=this._next_type=function(a){if(!(a&&a.length))return d(".type-section:first",i);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var h=o(b);if(h)for(;h.get(0)!==b.get(0);){a=h.find(".type-section:first");if(a.length)break;
h=o(h)}}return a},q=this.prev_type=function(){var a=f(),b=w(a);if(b){b=b.find(".kbs:first");m(a,b)}},w=this._prev_type=function(a){if(!(a&&a.length))return d(".type-section:last",i);var b=a.closest(".domain-section"),h=a.closest(".type-section");if(a.closest(".property-section").length)return h;var k;if(h.length)k=h.prev(".type-section");if(!(k&&k.length))if(a=s(b))for(;a.get(0)!==b.get(0);){k=a.find(".type-section:last");if(k.length)break;a=s(a)}return k},z=this.next_prop=function(){var a=f(),b=
t(a);if(b){b=b.find(".kbs:first");m(a,b)}},t=this._next_prop=function(a){if(!(a&&a.length))return d(".property-section:first",i);var b=a.closest(".domain-section"),h=a.closest(".type-section"),k=a.closest(".property-section");b=k.length?k.next(".property-section"):h.length?h.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=p(a))for(;a.get(0)!==h.get(0);){b=a.find(".property-section:first");if(b.length)break;if(h.get(0)==null)h=a;a=p(a)}return b},j=this.prev_prop=
function(){var a=f(),b=n(a);if(b){b=b.find(".kbs:first");m(a,b)}},n=this._prev_prop=function(a){if(!(a&&a.length))return d(".property-section:last",i);var b=a.closest(".domain-section"),h=a.closest(".type-section"),k=a.closest(".property-section");if(a.closest(".data-section").length)return k;var x;if(k.length)x=k.prev(".property-section");if(!(x&&x.length))if(q=h.length?w(h):w(b))for(;q.get(0)!==h.get(0);){x=q.find(".property-section:last");if(x.length)break;if(h.get(0)==null)h=q;q=w(q)}return x};
this.next=function(){var a=f(),b=this._next(a);b&&m(a,b)};this._next=function(a){if(!(a&&a.length))return d(".domain-section:first .kbs:first",i);var b=a.closest(".domain-section"),h=a.closest(".type-section"),k=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=k.next(".property-section").find(".kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else if(k.length){a=k.find(".data-section:first .kbs:first");if(a.length)return a;
a=k.next(".property-section").find(".kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else if(h.length){a=h.find(".property-section:first .kbs:first");if(a.length)return a;a=h.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===c.get(0)?g.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=f(),b=this._prev(a);b&&m(a,b)};this._prev=function(a){if(!(a&&a.length)){a=
d(".data-section:last .kbs:last",i);a.length||(a=d(".property-section:last .kbs:first",i));a.length||(a=d(".type-section:last .kbs:first",i));a.length||(a=d(".domain-section:last .kbs:first",i));return a}var b=a.closest(".domain-section"),h=a.closest(".type-section"),k=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return k.find(".kbs:first")}else if(k.length){a=k.prev(".property-section").find(".kbs:last");if(a.length)return a;return h.find(".kbs:first")}else if(h.length){a=
h.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===g.get(0)?c.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var u=this;d(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==d("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?r():l();else if(b===84)a.shiftKey?q():y();else if(b===80)a.shiftKey?j():z();else if(b===
74)u.next();else if(b===75)u.prev();else b===69&&u.edit()}})}})(jQuery);
(function(d,v){var i=window.propbox={init:function(g,c){c=d.extend({lang:"/lang/en"},c);if(!c.base_url)throw new Error("base_url required in propbox options");if(!c.id)throw new Error("topic id required in propbox options");if(!c.lang)throw new Error("lang required in propbox options");i.options=c;i.kbs=new v(g);i.kbs.next();d(".kbs",g).live("click",function(){var e=i.kbs.get_current();i.kbs.set_next(e,d(this),true)}).live("edit",function(){d(this).find(".row-menu-item:first a").click()}).hover(i.row_menu_hoverover,
i.row_menu_hoverout);i.init_row_menu(g);i.init_combo_menu(g)},init_row_menu:function(g){d(".menu-trigger",g).each(function(){var c=d(".row-menu:first").outerWidth();d(this).tooltip({events:{def:"click,mouseout"},relative:true,position:["bottom","right"],offset:[0,"-"+c],effect:"fade",delay:300})})},init_combo_menu:function(g){d(".combo-menu .default-action",g).live("click",function(){d(this).parents(".data-row:first").trigger("edit")})},row_menu_hoverover:function(){var g=d(this);i.row_menu_hoverover.timeout=
setTimeout(function(){g.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(i.row_menu_hoverover.timeout);d(this).removeClass("row-hover")},get_script:function(g,c){var e=i.get_script.cache;if(!e)e=i.get_script.cache={};var f=e[g];if(f)if(f.state===1)f.callbacks.push(c);else f.state===4&&c();else{f=e[g]={state:0,callbacks:[c]};d.ajax({url:i.options.base_url+g,dataType:"script",beforeSend:function(){f.state=1},success:function(){f.state=4;d.each(f.callbacks,function(m,l){l()})},
error:function(){f.state=-1}})}},prop_edit:function(g){g=d(g).parents(".row-menu:first").prev(".menu-trigger");g.data("tooltip").hide();g.parents(".property-section").find(".list-section .data-row:first .combo-menu .row-menu-item:first a").click();return false},prop_add:function(g){g=d(g).parents(".row-menu:first").prev(".menu-trigger");g.data("tooltip").hide();var c=g.parents(".property-section");if(c.is(".editing"))return false;c.addClass("editing");i.get_script("/propbox-edit.mf.js",function(){i.edit.prop_add_begin(c)});
return false},value_edit:function(g){g=d(g).parents(".row-menu:first").prev(".menu-trigger");g.data("tooltip").hide();var c=g.parents(".data-row:first"),e=c.parents(".property-section");if(e.is(".editing"))return false;e.addClass("editing");i.get_script("/propbox-edit.mf.js",function(){i.edit.value_edit_begin(e,c)});return false},value_delete:function(g){g=d(g).parents(".row-menu:first").prev(".menu-trigger");g.data("tooltip").hide();g=g.parents(".combo-menu:first").prev(".property-value");var c=
g.parents(".data-row:first");c.is("tr")?console.log("value_edit CVT",c.attr("data-id")):console.log("value_edit",g.attr("data-id")||g.attr("data-value"));if(c.parents(".property-section").is(".editing"))return false;return false}}})(jQuery,window.kbs);
