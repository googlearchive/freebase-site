
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
 
 jQuery Tools @VERSION Tooltip - UI essentials

 NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.

 http://flowplayer.org/tools/tooltip/

 Since: November 2008
 Date: @DATE 
*/
(function(c){c.factory("collapse_module",{init:function(){var f=this;this.$column=c(this.options.column);this.modules=c(this.options.modules,this.element);this.first_module=this.modules.get(0);this.trigger=c(".trigger:first",this.first_module);this.first_section=c(".module-section",this.first_module);this.other_modules=this.modules.slice(1);this.column_offset=this.$column.css("margin-left");this.set_collapsed(this.options.collapsed);this.trigger.click(function(l){return f.toggle(l)})},set_collapsed:function(f){if(this.toggle_state=
f){this.trigger.addClass("collapsed");this.$column.css("margin-left",0);this.first_section.hide();this.other_modules.hide()}else{this.trigger.removeClass("collapsed");this.$column.css("margin-left",this.column_offset);this.first_section.show();this.other_modules.show()}},toggle:function(){var f=this;if(this.toggle_state){c.localstore("filters_collapsed",0,false);this.trigger.removeClass("collapsed");this.$column.animate({marginLeft:this.column_offset},function(){f.first_section.slideDown(function(){f.modules.removeClass("collapsed")});
f.other_modules.fadeIn()})}else{c.localstore("filters_collapsed",1,false);this.trigger.addClass("collapsed");this.other_modules.fadeOut();this.first_section.slideUp(function(){f.$column.animate({marginLeft:0});f.modules.addClass("collapsed")})}this.toggle_state=!this.toggle_state;this.options.toggle_callback&&this.options.toggle_callback.call(this.trigger,this.toggle_state);return false}});var k=c("body").is(".embed")||c.localstore("filters_collapsed");c.extend(true,c.collapse_module,{defaults:{collapsed:k===
null?false:!!k,modules:".module",column:"#main-column"}})})(jQuery);
(function(c){function k(a,b,d){var i=d.relative?a.position().top:a.offset().top,g=d.relative?a.position().left:a.offset().left,j=d.position[0];i-=b.outerHeight()-d.offset[0];g+=a.outerWidth()+d.offset[1];var m=b.outerHeight()+a.outerHeight();if(j=="center")i+=m/2;if(j=="bottom")i+=m;j=d.position[1];a=b.outerWidth()+a.outerWidth();if(j=="center")g-=a/2;if(j=="left")g-=a;return{top:i,left:g}}function f(a,b){var d=this,i=a.add(d),g,j=0,m=0,p=a.attr("title"),r=l[b.effect],n,s=a.is(":input"),u=s&&a.is(":checkbox, :radio, select, :button, :submit"),
t=a.attr("type"),o=b.events[t]||b.events[s?u?"widget":"input":"def"];if(!r)throw'Nonexistent effect "'+b.effect+'"';o=o.split(/,\s*/);if(o.length!=2)throw"Tooltip: bad events configuration for "+t;a.bind(o[0],function(e){clearTimeout(j);if(b.predelay)m=setTimeout(function(){d.show(e)},b.predelay);else d.show(e)}).bind(o[1],function(e){clearTimeout(m);if(b.delay)j=setTimeout(function(){d.hide(e)},b.delay);else d.hide(e)});if(p&&b.cancelDefault){a.removeAttr("title");a.data("title",p)}c.extend(d,{show:function(e){if(!g){if(p)g=
c(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(p);else if(b.tip)g=c(b.tip).eq(0);else{g=a.next();g.length||(g=a.parent().next())}if(!g.length)throw"Cannot find tooltip for "+a;}if(d.isShown())return d;g.stop(true,true);var h=k(a,g,b);e=e||c.Event();e.type="onBeforeShow";i.trigger(e,[h]);if(e.isDefaultPrevented())return d;h=k(a,g,b);g.css({position:"absolute",top:h.top,left:h.left});n=true;r[0].call(d,function(){e.type="onShow";n="full";i.trigger(e)});h=b.events.tooltip.split(/,\s*/);
g.bind(h[0],function(){clearTimeout(j);clearTimeout(m)});h[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&g.bind(h[1],function(q){q.relatedTarget!=a[0]&&a.trigger(o[1].split(" ")[0])});return d},hide:function(e){if(!g||!d.isShown())return d;e=e||c.Event();e.type="onBeforeHide";i.trigger(e);if(!e.isDefaultPrevented()){n=false;l[b.effect][1].call(d,function(){e.type="onHide";n=false;i.trigger(e)});return d}},isShown:function(e){return e?n=="full":n},getConf:function(){return b},getTip:function(){return g},
getTrigger:function(){return a}});c.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(e,h){c.isFunction(b[h])&&c(d).bind(h,b[h]);d[h]=function(q){c(d).bind(h,q);return d}})}c.tools=c.tools||{version:"@VERSION"};c.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},
layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,d){l[a]=[b,d]}};var l={toggle:[function(a){var b=this.getConf(),d=this.getTip();b=b.opacity;b<1&&d.css({opacity:b});d.show();a.call()},function(a){this.getTip().hide();a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};c.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=c.extend(true,{},c.tools.tooltip.conf,a);
if(typeof a.position=="string")a.position=a.position.split(/,?\s/);this.each(function(){b=new f(c(this),a);c(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
(function(c,k){k.filters={init_domain_type_property_filter:function(f){c(":text[name=domain], :text[name=type], :text[name=property]",f).suggest(c.extend({scoring:"schema",format:null,mql_output:JSON.stringify([{id:null,name:null,type:{id:null,"id|=":["/type/domain","/type/type","/type/property"],limit:1}}])},k.suggest_options.any("type:/type/domain","type:/type/type","type:/type/property"))).bind("fb-select",function(l,a){var b=c(this);b.val(a.id);var d=a.type.id;if(d==="/type/domain")b.attr("name",
"domain");else if(d==="/type/type")b.attr("name","type");else d==="/type/property"&&b.attr("name","property");this.form.submit()}).parents(".filter-form").submit(function(){return false})}};c(function(){c(".filter-form :input").keypress(function(f){f.keyCode===13&&this.form.submit();return true});c(".filter-help-trigger").tooltip({events:{def:"click,mouseout"},position:"top center",effect:"fade",delay:300,offset:[-8,0]});c(".filter-form-trigger").click(function(){var f=c(this).siblings(".filter-form");
f.is(":hidden")?f.slideDown(function(){c(":text:first",f).focus()}):f.slideUp()})})})(jQuery,window.freebase);
