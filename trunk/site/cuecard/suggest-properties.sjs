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

var callback = acre.environ.params["callback"];
var worker = acre.require("worker");

var uniqueTypes = [];
var uniqueTypeMap = {};

if ("p" in acre.environ.params) {
  var property = acre.environ.params["p"];
  if (property.length > 0) {
    var reverse = acre.environ.params["r"] == "true";
    
    if (reverse) {
      var slash = property.lastIndexOf("/");
      var type = property.substr(0, slash);
      
      uniqueTypeMap[type] = { index: uniqueTypes.length, explicit: true };
      uniqueTypes.push(type);
    } else {
      try {
        var r = acre.freebase.mqlread({
          "id" : property,
          "type" : "/type/property",
          "expected_type" : [{ "id" : null, "name" : null }]
        }).result;
        
        if ("expected_type" in r && r.expected_type != null) {
          var expectedTypes = r.expected_type;
          for (var i = 0; i < expectedTypes.length; i++) {
            var expectedType = expectedTypes[i];
            uniqueTypeMap[expectedType.id] = { index: uniqueTypes.length, explicit: true };
            uniqueTypes.push(expectedType.id);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
}
worker.expandIncludedTypes(acre.environ.params["t"], acre.environ.params["i"], acre.environ.params["g"], uniqueTypes, uniqueTypeMap);

if (uniqueTypes.length == 0) {
  uniqueTypes.push("/type/object");
  uniqueTypeMap["/type/object"] = { index: 0, explicit: true };
}

var properties = worker.getPropertiesOfTypes(uniqueTypes, uniqueTypeMap, function(){});
worker.addCVTProperties(properties, uniqueTypes, uniqueTypeMap);

acre.start_response(200);
if (callback) {
  acre.write(callback + "(");
}
acre.write(JSON.stringify({ properties: properties }));
if (callback) {
  acre.write(")");
}