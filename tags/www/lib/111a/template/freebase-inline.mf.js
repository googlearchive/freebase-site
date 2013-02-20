
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
(function(b){b.cookie=function(b,d,a){if("undefined"!=typeof d){a=a||{};null===d&&(d="",a.expires=-1);var c="";if(a.expires&&("number"==typeof a.expires||a.expires.toUTCString))"number"==typeof a.expires?(c=new Date,c.setTime(c.getTime()+864E5*a.expires)):c=a.expires,c="; expires="+c.toUTCString();var e=a.path?"; path="+a.path:"",f=a.domain?"; domain="+a.domain:"",a=a.secure?"; secure":"";document.cookie=[b,"=",encodeURIComponent(d),c,e,f,a].join("")}else{d=null;if(document.cookie&&""!=document.cookie){a=
document.cookie.split(";");for(c=0;c<a.length;c++)if(e=a[c].trim(),e.substring(0,b.length+1)==b+"="){d=decodeURIComponent(e.substring(b.length+1));break}}return d}};b.cookie("fb-dateline-reload")?b.cookie("fb-dateline-reload",null,{path:"/"}):b.cookie("fb-dateline")!==b.dateline&&(b.cookie("fb-dateline-reload","true",{path:"/"}),b.datelineReloading=!0,window.location.reload(!0))})(window.SERVER);
