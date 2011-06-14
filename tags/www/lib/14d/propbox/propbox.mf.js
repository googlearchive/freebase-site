
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
(function(d){var o=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(e){d(".kbs.current",e).removeClass("current");var f=d(".domain-section:first",e),g=d(".domain-section:last",e),i=this.scroll_to=function(a){var b=d(document).scrollTop();d(document).height();var c=o().h;c=b+c;var h=a.offset().top;a=h+a.height();if(h<b)d(document).scrollTop(h);else a>c&&d(document).scrollTop(b+(a-c))},j=this.get_current=function(){return d(".kbs.current:first",e)},k=this.set_next=function(a,b,c){a=a||j();if(b.length){a.removeClass("current");b.addClass("current");
c||i(b)}},q=this.next_domain=function(a){var b=j(),c=p(b);if(c){c=c.find(".kbs:first");k(b,c,a)}},p=this._next_domain=function(a){if(!(a&&a.length))return d(".domain-section:first",e);a=a.closest(".domain-section");return!a.length||a[0]===g[0]?f:a.next(".domain-section")},u=this.prev_domain=function(){var a=j(),b=r(a);if(b){b=b.find(".kbs:first");k(a,b)}},r=this._prev_domain=function(a){if(!(a&&a.length))return d(".domain-section:last",e);var b=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return b;return!b.length||b[0]===f[0]?g:b.prev(".domain-section")},v=this.next_type=function(){var a=j(),b=s(a);if(b){b=b.find(".kbs:first");k(a,b)}},s=this._next_type=function(a){if(!(a&&a.length))return d(".type-section:first",e);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var c=p(b);if(c)for(;c.get(0)!==b.get(0);){a=c.find(".type-section:first");if(a.length)break;
c=p(c)}}return a},l=this.prev_type=function(){var a=j(),b=n(a);if(b){b=b.find(".kbs:first");k(a,b)}},n=this._prev_type=function(a){if(!(a&&a.length))return d(".type-section:last",e);var b=a.closest(".domain-section"),c=a.closest(".type-section");if(a.closest(".property-section").length)return c;var h;if(c.length)h=c.prev(".type-section");if(!(h&&h.length))if(a=r(b))for(;a.get(0)!==b.get(0);){h=a.find(".type-section:last");if(h.length)break;a=r(a)}return h},x=this.next_prop=function(){var a=j(),b=
w(a);if(b){b=b.find(".kbs:first");k(a,b)}},w=this._next_prop=function(a){if(!(a&&a.length))return d(".property-section:first",e);var b=a.closest(".domain-section"),c=a.closest(".type-section"),h=a.closest(".property-section");b=h.length?h.next(".property-section"):c.length?c.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=s(a))for(;a.get(0)!==c.get(0);){b=a.find(".property-section:first");if(b.length)break;if(c.get(0)==null)c=a;a=s(a)}return b},z=this.prev_prop=
function(){var a=j(),b=y(a);if(b){b=b.find(".kbs:first");k(a,b)}},y=this._prev_prop=function(a){if(!(a&&a.length))return d(".property-section:last",e);var b=a.closest(".domain-section"),c=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length)return h;var m;if(h.length)m=h.prev(".property-section");if(!(m&&m.length))if(l=c.length?n(c):n(b))for(;l.get(0)!==c.get(0);){m=l.find(".property-section:last");if(m.length)break;if(c.get(0)==null)c=l;l=n(l)}return m};
this.next=function(){var a=j(),b=this._next(a);b&&k(a,b)};this._next=function(a){if(!(a&&a.length))return d(".domain-section:first .kbs:first",e);var b=a.closest(".domain-section"),c=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=h.next(".property-section").find(".kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else if(h.length){a=h.find(".data-section:first .kbs:first");if(a.length)return a;
a=h.next(".property-section").find(".kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else if(c.length){a=c.find(".property-section:first .kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===g.get(0)?f.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=j(),b=this._prev(a);b&&k(a,b)};this._prev=function(a){if(!(a&&a.length)){a=
d(".data-section:last .kbs:last",e);a.length||(a=d(".property-section:last .kbs:first",e));a.length||(a=d(".type-section:last .kbs:first",e));a.length||(a=d(".domain-section:last .kbs:first",e));return a}var b=a.closest(".domain-section"),c=a.closest(".type-section"),h=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return h.find(".kbs:first")}else if(h.length){a=h.prev(".property-section").find(".kbs:last");if(a.length)return a;return c.find(".kbs:first")}else if(c.length){a=
c.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===f.get(0)?g.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var t=this;d(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==d("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?u():q();else if(b===84)a.shiftKey?l():v();else if(b===80)a.shiftKey?z():x();else if(b===
74)t.next();else if(b===75)t.prev();else b===69&&t.edit()}})}})(jQuery);
(function(d,o){var e=window.propbox={init:function(f,g){g=d.extend({lang:"/lang/en"},g);if(!g.base_ajax_url)throw new Error("base_ajax_url required in propbox options");if(!g.base_static_url)throw new Error("base_static_url required in propbox options");if(!g.id)throw new Error("topic id required in propbox options");if(!g.lang)throw new Error("lang required in propbox options");e.options=g;e.kbs=new o(f);e.kbs.set_next(e.kbs.get_current(),d(".kbs:visible:first",f,true));d(".kbs",f).live("click",
function(){var i=e.kbs.get_current();e.kbs.set_next(i,d(this),true)}).live("edit",function(){d(this).find(".submenu:first li:first a").click()});e.init_menus(f)},init_menus:function(f,g){f=d(f||document);g&&d(".nicemenu",f).nicemenu();(f&&f.is(".data-row")?f:d(".data-row",f)).hover(e.row_menu_hoverover,e.row_menu_hoverout);d(".nicemenu .headmenu",f).add(d(".nicemenu .default-action",f)).click("click",function(){var i=e.kbs.get_current();e.kbs.set_next(i,d(this).parents(".kbs:first"),true);return false})},
row_menu_hoverover:function(){var f=d(this);e.row_menu_hoverover.timeout=setTimeout(function(){f.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(e.row_menu_hoverover.timeout);d(this).removeClass("row-hover")},get_script:function(f,g){var i=e.get_script.cache;if(!i)i=e.get_script.cache={};var j=i[f];if(j)if(j.state===1)j.callbacks.push(g);else j.state===4&&g();else{j=i[f]={state:0,callbacks:[g]};d.ajax({url:e.options.base_static_url+f,dataType:"script",beforeSend:function(){j.state=
1},success:function(){j.state=4;d.each(j.callbacks,function(k,q){q()})},error:function(){j.state=-1}})}},prop_edit:function(f,g){var i=d(f).parents(".property-section").find(".data-section .data-row:first:visible .nicemenu:first .headmenu:first a");i.length?i.click():e.prop_add(f,g);return false},prop_add:function(f,g){var i=d(f).parents(".property-section");if(i.is(".editing"))return false;i.addClass("editing");e.get_script("/propbox-edit.mf.js",function(){e.edit.prop_add_begin(i,g)});return false},
value_edit:function(f){var g=d(f).parents(".data-row:first"),i=g.parents(".property-section");if(i.is(".editing"))return false;i.addClass("editing");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_edit_begin(i,g)});return false},value_delete:function(f){var g=d(f).parents(".data-row:first"),i=g.parents(".property-section");if(i.is(".editing"))return false;i.addClass("editing");e.get_script("/propbox-edit.mf.js",function(){e.edit.value_delete_begin(i,g)});return false},close_message:function(f){d(f).parents(".row-msg:first").remove();
return false}}})(jQuery,window.kbs);
