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
 */
 

function split_id(id) { 
 
  var parts = id.split('/');
  
  return [parts.slice(0, -1).join('/'), parts[parts.length-1]];
  
}

//updates d1 with the values of d2
//if key exists in both dicts, values are added (so strings are concatenated - use for numbers only)
//if key only exists in one, it's set on d1
function dict_update(d1, d2) { 
  
  
  for (i in d1) { 
    if (d2[i]) { d1[i] = d1[i] + d2[i]; }
  }
  
  for (i in d2) { 
    if (!d1[i]) { d1[i] = d2[i]; }
  }
  
  
}

function app_url(app_id) { 
  
  var parts = app_id.split('/');
  var url = "http://";
  for (i= parts.length-1; i > 0; i--) { 
    url += parts[i] + '.';
  }
  
  url += "dev.freebaseapps.com";    
      
  return url;      
}

function ppn(n) { 
  var v = String(n);
  var r = '';
  
  var c = 0;
  for (var i = v.length-1; i >= 0; i--) {
    if (c && !(c%3)) { r = ',' + r; }
    r = v.slice(i,i+1) + r; 
    c++;
  }
  return r;
}