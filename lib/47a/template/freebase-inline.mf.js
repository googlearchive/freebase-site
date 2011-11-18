
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
(function(d){d.cookie=function(e,c,a){if(typeof c!="undefined"){a=a||{};if(c===null){c="";a.expires=-1}var b="";if(a.expires&&(typeof a.expires=="number"||a.expires.toUTCString)){if(typeof a.expires=="number"){b=new Date;b.setTime(b.getTime()+a.expires*24*60*60*1E3)}else b=a.expires;b="; expires="+b.toUTCString()}var f=a.path?"; path="+a.path:"",i=a.domain?"; domain="+a.domain:"";a=a.secure?"; secure":"";document.cookie=[e,"=",encodeURIComponent(c),b,f,i,a].join("")}else{c=null;if(document.cookie&&
document.cookie!=""){a=document.cookie.split(";");for(b=0;b<a.length;b++){f=a[b].trim();if(f.substring(0,e.length+1)==e+"="){c=decodeURIComponent(f.substring(e.length+1));break}}}return c}};if(d.cookie("mwLWTReloaded"))d.cookie("mwLWTReloaded",null,{path:"/"});else{var g=d.cookie("mwLastWriteTime"),h=SERVER.mwLastWriteTime;g=g?parseInt(g,10):-1;if((h?parseInt(h,10):-1)<g){d.cookie("mwLWTReloaded","true",{path:"/"});SERVER.mwLWTReloading=true;window.location.reload(true)}}})(SERVER);
