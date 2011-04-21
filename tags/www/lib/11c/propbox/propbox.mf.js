
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
(function(e){var o=function(){return typeof window.innerWidth!="undefined"?function(){return{w:window.innerWidth,h:window.innerHeight}}:typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0?function(){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight}}:function(){return{w:document.getElementsByTagName("body")[0].clientWidth,h:document.getElementsByTagName("body")[0].clientHeight}}}();
window.kbs=function(d){e(".kbs.current",d).removeClass("current");var h=e(".domain-section:first",d),g=e(".domain-section:last",d),j=this.scroll_to=function(a){var b=e(document).scrollTop();e(document).height();var c=o().h;c=b+c;var f=a.offset().top;a=f+a.height();if(f<b)e(document).scrollTop(f);else a>c&&e(document).scrollTop(b+(a-c))},i=this.get_current=function(){return e(".kbs.current:first",d)},k=this.set_next=function(a,b,c){if(b.length){a.removeClass("current");b.addClass("current");c||j(b)}},
q=this.next_domain=function(a){var b=i(),c=p(b);if(c){c=c.find(".kbs:first");k(b,c,a)}},p=this._next_domain=function(a){if(!(a&&a.length))return e(".domain-section:first",d);a=a.closest(".domain-section");return!a.length||a[0]===g[0]?h:a.next(".domain-section")},u=this.prev_domain=function(){var a=i(),b=r(a);if(b){b=b.find(".kbs:first");k(a,b)}},r=this._prev_domain=function(a){if(!(a&&a.length))return e(".domain-section:last",d);var b=a.closest(".domain-section");if(a.closest(".property-section").length||
a.closest(".type-section").length)return b;return!b.length||b[0]===h[0]?g:b.prev(".domain-section")},v=this.next_type=function(){var a=i(),b=s(a);if(b){b=b.find(".kbs:first");k(a,b)}},s=this._next_type=function(a){if(!(a&&a.length))return e(".type-section:first",d);var b=a.closest(".domain-section");a=a.closest(".type-section");a=a.length?a.next(".type-section"):b.find(".type-section:first");if(!(a&&a.length)){var c=p(b);if(c)for(;c.get(0)!==b.get(0);){a=c.find(".type-section:first");if(a.length)break;
c=p(c)}}return a},l=this.prev_type=function(){var a=i(),b=n(a);if(b){b=b.find(".kbs:first");k(a,b)}},n=this._prev_type=function(a){if(!(a&&a.length))return e(".type-section:last",d);var b=a.closest(".domain-section"),c=a.closest(".type-section");if(a.closest(".property-section").length)return c;var f;if(c.length)f=c.prev(".type-section");if(!(f&&f.length))if(a=r(b))for(;a.get(0)!==b.get(0);){f=a.find(".type-section:last");if(f.length)break;a=r(a)}return f},x=this.next_prop=function(){var a=i(),b=
w(a);if(b){b=b.find(".kbs:first");k(a,b)}},w=this._next_prop=function(a){if(!(a&&a.length))return e(".property-section:first",d);var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section");b=f.length?f.next(".property-section"):c.length?c.find(".property-section:first"):b.find(".property-section:first");if(!(b&&b.length))if(a=s(a))for(;a.get(0)!==c.get(0);){b=a.find(".property-section:first");if(b.length)break;if(c.get(0)==null)c=a;a=s(a)}return b},z=this.prev_prop=
function(){var a=i(),b=y(a);if(b){b=b.find(".kbs:first");k(a,b)}},y=this._prev_prop=function(a){if(!(a&&a.length))return e(".property-section:last",d);var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section");if(a.closest(".data-section").length)return f;var m;if(f.length)m=f.prev(".property-section");if(!(m&&m.length))if(l=c.length?n(c):n(b))for(;l.get(0)!==c.get(0);){m=l.find(".property-section:last");if(m.length)break;if(c.get(0)==null)c=l;l=n(l)}return m};
this.next=function(){var a=i(),b=this._next(a);b&&k(a,b)};this._next=function(a){if(!(a&&a.length))return e(".domain-section:first .kbs:first",d);var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section");if(a.closest(".data-section").length){a=a.next(".kbs");if(a.length)return a;a=f.next(".property-section").find(".kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else if(f.length){a=f.find(".data-section:first .kbs:first");if(a.length)return a;
a=f.next(".property-section").find(".kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else if(c.length){a=c.find(".property-section:first .kbs:first");if(a.length)return a;a=c.next(".type-section").find(".kbs:first")}else a=b.find(".type-section:first .kbs:first");if(a.length)return a;return b.get(0)===g.get(0)?h.find(".kbs:first"):b.next(".domain-section").find(".kbs:first")};this.prev=function(){var a=i(),b=this._prev(a);b&&k(a,b)};this._prev=function(a){if(!(a&&a.length)){a=
e(".data-section:last .kbs:last",d);a.length||(a=e(".property-section:last .kbs:first",d));a.length||(a=e(".type-section:last .kbs:first",d));a.length||(a=e(".domain-section:last .kbs:first",d));return a}var b=a.closest(".domain-section"),c=a.closest(".type-section"),f=a.closest(".property-section");if(a.closest(".data-section").length){a=a.prev(".kbs");if(a.length)return a;return f.find(".kbs:first")}else if(f.length){a=f.prev(".property-section").find(".kbs:last");if(a.length)return a;return c.find(".kbs:first")}else if(c.length){a=
c.prev(".type-section").find(".kbs:last");if(a.length)return a;return b.find(".kbs:first")}else return b.get(0)===h.get(0)?g.find(".kbs:last"):b.prev(".domain-section").find(".kbs:last")};this.edit=function(){this.get_current().trigger("edit")};var t=this;e(document).unbind(".kbs").bind("keydown.kbs",function(a){var b=a.target;if(b==document.body||b==document||b==window||b==e("html")[0]){b=a.keyCode;if(b===68)a.shiftKey?u():q();else if(b===84)a.shiftKey?l():v();else if(b===80)a.shiftKey?z():x();else if(b===
74)t.next();else if(b===75)t.prev();else b===69&&t.edit()}})}})(jQuery);
(function(e,o){var d=window.propbox={init:function(h,g){g=e.extend({lang:"/lang/en"},g);if(!g.base_url)throw new Error("base_url required in propbox options");if(!g.id)throw new Error("topic id required in propbox options");if(!g.lang)throw new Error("lang required in propbox options");d.options=g;d.kbs=new o(h);d.kbs.set_next(d.kbs.get_current(),e(".kbs:visible:first",h,true));e(".kbs",h).live("click",function(){var j=d.kbs.get_current();d.kbs.set_next(j,e(this),true)}).live("edit",function(){e(this).find(".submenu:first li:first a").click()}).hover(d.row_menu_hoverover,
d.row_menu_hoverout)},row_menu_hoverover:function(){var h=e(this);d.row_menu_hoverover.timeout=setTimeout(function(){h.addClass("row-hover")},300)},row_menu_hoverout:function(){clearTimeout(d.row_menu_hoverover.timeout);e(this).removeClass("row-hover")},get_script:function(h,g){var j=d.get_script.cache;if(!j)j=d.get_script.cache={};var i=j[h];if(i)if(i.state===1)i.callbacks.push(g);else i.state===4&&g();else{i=j[h]={state:0,callbacks:[g]};e.ajax({url:d.options.base_url+h,dataType:"script",beforeSend:function(){i.state=
1},success:function(){i.state=4;e.each(i.callbacks,function(k,q){q()})},error:function(){i.state=-1}})}},_dojo_loaded:false,_dojo_version:"1.6.0",get_dojo:function(h,g){g()},prop_edit:function(h){e(h).parents(".property-section").find(".data-section .data-row:first .nicemenu:first .headmenu:first a").click();return false},prop_add:function(h){var g=e(h).parents(".property-section");if(g.is(".editing"))return false;g.addClass("editing");d.get_dojo(d.options.lang,function(){d.get_script("/propbox-edit.mf.js",
function(){d.edit.prop_add_begin(g)})});return false},value_edit:function(h){console.log("value_edit");var g=e(h).parents(".data-row:first"),j=g.parents(".property-section");if(j.is(".editing"))return false;j.addClass("editing");d.get_dojo(d.options.lang,function(){d.get_script("/propbox-edit.mf.js",function(){d.edit.value_edit_begin(j,g)})});return false},value_delete:function(h){if(e(h).parents(".data-row:first").parents(".property-section").is(".editing"))return false;return false}}})(jQuery,window.kbs);
