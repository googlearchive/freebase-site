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
 */

function get_node(node, path) {
  if (path.length > 0) {
    var segments = path.split(".");
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment.length > 0) {
        if (node.type == "module" && node.members[segment]) {
          node = node.members[segment];
          if (node == undefined || node == null || typeof node != "object") {
            break;
          }
        } else {
          node = null;
          break;
        }
      }
    }
  }
  return node;
};

function renderNode(node, level, path, results) {
  if (node != null && node.type == 'module') {
    for (var n in node.members) {
      var v = node.members[n];
      if (v != null && v.type == 'module') {
        var path2 = [].concat(path);
        path2.push(n);   
        results.push({ 
          "name" : path2.join("."), 
          "key" : path2.join("."),
          "deprecated" : !!v.deprecated
        });
        renderNode(v, level - 1, path2, results);
      }
    }
  }
}
