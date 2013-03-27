
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
(function(f,d){d.discuss=d.discuss||{};f.extend(d.discuss,{toggle_discuss:function(a){var b=f("#page-content-wrapper"),c=f("#page-discuss-wrapper"),h,e;0<c.width()?(h="100%",e=0):(h="73%",e="23%",c.show(),c.data("initialized")||(f("#discuss-frame").attr("src",d.discuss.docos_url(a)),c.data("initialized",!0)));var g=0;b.animate({width:h},{duration:"normal",complete:function(){g++;g===2&&e===0&&c.hide()}});c.animate({width:e},{duration:"normal",complete:function(){g++;g===2&&e===0&&c.hide()}})},docos_url:function(a){if("/"!==
a.charAt(0))return"";0!=a.indexOf("/m/")&&(a="/m"+a);a="FREEBASE-0"+a.replace(/\//g,"-");if(-1!=d.acre.request.server_name.indexOf("sandbox-freebase.com")){var b=new Date;b.setDate(b.getDate()-b.getDay());a+="-"+b.getFullYear()+(b.getMonth()+1)+b.getDate()}return""===a?"":"https://docs.google.com/comments/d/"+a+"/embed"}})})(jQuery,window.freebase);
