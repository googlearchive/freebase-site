
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
(function(b){function f(e){return(e=e.match(/\w+$/g))?e[0]:""}b.cookie=function(e,b,a){if("undefined"!=typeof b){a=a||{};null===b&&(b="",a.expires=-1);var d="";if(a.expires&&("number"==typeof a.expires||a.expires.toUTCString))"number"==typeof a.expires?(d=new Date,d.setTime(d.getTime()+864E5*a.expires)):d=a.expires,d="; expires="+d.toUTCString();var c=a.path?"; path="+a.path:"",f=a.domain?"; domain="+a.domain:"",a=a.secure?"; secure":"";document.cookie=[e,"=",encodeURIComponent(b),d,c,f,a].join("")}else{b=
null;if(document.cookie&&""!=document.cookie){a=document.cookie.split(";");for(d=0;d<a.length;d++)if(c=a[d].trim(),c.substring(0,e.length+1)==e+"="){b=decodeURIComponent(c.substring(e.length+1));break}}return b}};if(b.cookie("fb-dateline-reload"))b.cookie("fb-dateline-reload",null,{path:"/"});else{var c;c=b.cookie("fb-dateline");var g=b.dateline;!c||!g?c=void 0:(c.replace(/^"|"$/g,""),c=f(c)>f(g));c&&(b.cookie("fb-dateline-reload","true",{path:"/"}),b.datelineReloading=!0,window.location.reload(!0))}})(window.SERVER);
