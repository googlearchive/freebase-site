
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
(function(c){var o=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(e){c(".kbs.current",e).removeClass("current");var f=c(".domain-section:first",e),g=c(".domain-section:last",e),h=this.scroll_to=function(a){var b=c(document).scrollTop();c(document).height();var d=o().h;d=b+d;var i=a.offset().top;a=i+a.height();if(i<b)c(document).scrollTop(i);else a>d&&c(document).scrollTop(b+(a-d))},j=this.get_current=function(){return c(".kbs.current:first",e)},k=this.set_next=function(a,b,d){a=a||j();if(b.length){a.removeClass("current");b.addClass("current");
d||h(b)}},q=this.next_domain=function(a){var b=j(),d=p(b);if(d){d=d.find(".kbs:first");k(b,d,a)}},p=this._next_domain=function(a){if(!(a&&a.length))return c(".domain-section:first",e);a=a.closest(".domain-section");return!a.length||a[0]===g[0]?f:a.next(".domain-section")},u=this.prev_domain=function(){var a=j(),b=r(a);if(b){b=b.find(".kbs:first");k(a,b)}},r=this._prev_domain=function(a){if(!(a&&a.length))return c(".domain-section:last",e);var b=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return b;return!b.length||b[0]===f[0]?g:b.prev(".domain-section")},v=this.next_type=function(){var a=j(),b=s(a);if(b){b=b.find(".kbs:first");k(a,b)}},s=this._next_type=function(a){if(!(a&&a.length))return c(".type-section:first",e);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var d=p(b);if(d)for(;d.get(0)!==b.get(0);){a=d.find(".type-section:first");if(a.length)break;
d=p(d)}}return a},l=this.prev_type=function(){var a=j(),b=n(a);if(b){b=b.find(".kbs:first");k(a,b)}},n=this._prev_type=function(a){if(!(a&&a.length))return c(".type-section:last",e);var b=a.closest(".domain-section"),d=a.closest(".type-section");if(a.closest(".property-section").length)return d;var i;if(d.length)i=d.prev(".type-section");if(!(i&&i.length))if(a=r(b))for(;a.get(0)!==b.get(0);){i=a.find(".type-section:last");if(i.length)break;a=r(a)}return i},x=this.next_prop=function(){var a=j(),b=
w(a);if(b){b=b.find(".kbs:first");k(a,b)}},w=this._next_prop=function(a){if(!(a&&a.length))return c(".property-section:first",e);var b=a.closest(".domain-section"),d=a.closest(".type-section"),i=a.closest(".property-section");b=i.length?i.next(".property-section"):d.length?d.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=s(a))for(;a.get(0)!==d.get(0);){b=a.find(".property-section:first");if(b.length)break;if(d.get(0)==null)d=a;a=s(a)}return b},z=this.prev_prop=
function(){var a=j(),b=y(a);if(b){b=b.find(".kbs:first");k(a,b)}},y=this._prev_prop=function(a){if(!(a&&a.length))return c(".property-section:last",e);var b=a.closest(".domain-section"),d=a.closest(".type-section"),i=a.closest(".property-section");if(a.closest(".data-section").length)return i;var m;if(i.length)m=i.prev(".property-section");if(!(m&&m.length))if(l=d.length?n(d):n(b))for(;l.get(0)!==d.get(0);){m=l.find(".property-section:last");if(m.length)break;if(d.get(0)==null)d=l;l=n(l)}return m};
this.next=function(){var a=j(),b=this._next(a);b&&k(a,b)};this._next=function(a){if(!(a&&a.length))return c(".domain-section:first .kbs:first",e);var b=a.closest(".domain-section"),d=a.closest(".type-section"),i=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=i.next(".property-section").find(".kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else if(i.length){a=i.find(".data-section:first .kbs:first");if(a.length)return a;
a=i.next(".property-section").find(".kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else if(d.length){a=d.find(".property-section:first .kbs:first");if(a.length)return a;a=d.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===g.get(0)?f.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=j(),b=this._prev(a);b&&k(a,b)};this._prev=function(a){if(!(a&&a.length)){a=
c(".data-section:last .kbs:last",e);a.length||(a=c(".property-section:last .kbs:first",e));a.length||(a=c(".type-section:last .kbs:first",e));a.length||(a=c(".domain-section:last .kbs:first",e));return a}var b=a.closest(".domain-section"),d=a.closest(".type-section"),i=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return i.find(".kbs:first")}else if(i.length){a=i.prev(".property-section").find(".kbs:last");if(a.length)return a;return d.find(".kbs:first")}else if(d.length){a=
d.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===f.get(0)?g.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var t=this;c(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==c("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?u():q();else if(b===84)a.shiftKey?l():v();else if(b===80)a.shiftKey?z():x();else if(b===
74)t.next();else if(b===75)t.prev();else b===69&&t.edit()}})}})(jQuery);
(function(c,o){var e=window.propbox={init:function(f,g){g=c.extend({lang:"/lang/en"},g);if(!g.base_ajax_url)throw new Error("base_ajax_url required in propbox options");if(!g.base_static_url)throw new Error("base_static_url required in propbox options");if(!g.id)throw new Error("topic id required in propbox options");if(!g.lang)throw new Error("lang required in propbox options");e.options=g;e.kbs=new o(f);e.kbs.set_next(e.kbs.get_current(),c(".kbs:visible:first",f,true));c(".kbs",f).live("click",
function(){var h=e.kbs.get_current();e.kbs.set_next(h,c(this),true)}).live("edit",function(){var h=c(this).find(".headmenu:first").data("submenu");h&&c("li:first a:first",h).click()});e.init_menus(f)},init_menus:function(f,g){f=c(f||document);g&&c(".nicemenu",f).nicemenu();(f&&f.is(".data-row")?f:c(".data-row",f)).hover(e.row_menu_hoverover,e.row_menu_hoverout);c(".nicemenu .headmenu",f).add(c(".nicemenu .default-action",f)).click("click",function(){var h=e.kbs.get_current();e.kbs.set_next(h,c(this).parents(".kbs:first"),
true);return false})},row_menu_hoverover:function(){var f=c(this);e.row_menu_hoverover.timeout=setTimeout(function(){f.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(e.row_menu_hoverover.timeout);c(this).removeClass("row-hover")},get_script:function(f,g){var h=e.get_script.cache;if(!h)h=e.get_script.cache={};var j=h[f];if(j)if(j.state===1)j.callbacks.push(g);else j.state===4&&g();else{j=h[f]={state:0,callbacks:[g]};c.ajax({url:e.options.base_static_url+f,dataType:"script",
beforeSend:function(){j.state=1},success:function(){j.state=4;c.each(j.callbacks,function(k,q){q()})},error:function(){j.state=-1}})}},prop_edit:function(f,g){var h=c(f).parents(".submenu").data("headmenu").parents(".property-section").find(".data-section .data-row:first:visible .nicemenu:first .headmenu:first a");h.length?h.click():e.prop_add(f,g);return false},prop_add:function(f,g){var h=c(f).parents(".submenu").data("headmenu").parents(".property-section");if(h.is(".editing"))return false;h.addClass("editing");
e.get_script("/propbox-edit.mf.js",function(){e.edit.prop_add_begin(h,g)});return false},value_edit:function(f){var g=c(f).parents(".submenu").data("headmenu").parents(".data-row:first"),h=g.parents(".property-section");if(h.is(".editing"))return false;h.addClass("editing");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_edit_begin(h,g)});return false},value_delete:function(f){var g=c(f).parents(".submenu").data("headmenu").parents(".data-row:first"),h=g.parents(".property-section");if(h.is(".editing"))return false;
h.addClass("editing");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_delete_begin(h,g)});return false},close_message:function(f){c(f).parents(".row-msg:first").remove();return false}}})(jQuery,window.kbs);
