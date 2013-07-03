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

acre.require("lib/promise/es5");

var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var urlfetch = acre.require("lib/promise/apis").urlfetch;

//---Simple---
acre.write("---Simple---\n");
urlfetch("http://www.metaweb.com").then(function(response) {
  acre.write(response.status);
});

acre.async.wait_on_results();

//---Error---
acre.write("\n\n---Error---\n");
urlfetch("http://www.metaweb.com/elephant")
  .then(function(response) {
    acre.write("The animal is in the house!");
    return response;
    
  }, function(error) {
    if (error.info.status === 404) {
      acre.write("No elephant found :(");
    } else if (error.info.status === 500) {
      acre.write("Reply hazy. Try again soon.");
    } else {
       return error;
    }
  });

acre.async.wait_on_results();

//---Chaining---
acre.write("\n\n---Chaining---\n");
freebase.mqlread({id: "/en/metaweb", name: null})
  .then(function(envelope) {
    return envelope.result;
  })
  .then(function(result) {
    return result.name;
  })
  .then(function(name) {
    acre.write(name);
  });

acre.async.wait_on_results();

//---Waiting on multiple promises---
acre.write("\n\n---Waiting on multiple promises---\n");
var psteam = freebase.mqlread({id: "/en/steam", name: null});
var ppunk = freebase.mqlread({id: "/en/punk", name: null});
deferred.all([psteam, ppunk])
  .then(function([steam, punk]) {
    acre.write(steam.result.name);
    acre.write(punk.result.name);
  });

acre.async.wait_on_results();

//---Chaining Tree---
acre.write("\n\n---Chaining Tree---\n");
var query = {
  "id": "/en/lady_gaga",
  "name": null,
  "type": "/people/person",
  "place_of_birth": {"id": null, "limit": 1}
};
var pgaga = freebase.mqlread(query)
  .then(function(envelope) {
    return envelope.result;
  })

pgaga
  .then(function(result) {
    return result.name
  })
  .then(function(name) {
    acre.write(" - " + name + " - ");
  });

pgaga
  .then(function(result) {
    return freebase.mqlread({"id": result.place_of_birth.id, name: null});
  })
  .then(function(envelope) {
    return envelope.result.name;
  })
  .then(acre.write);

acre.async.wait_on_results();

//---Passing along arguments---
acre.write("\n\n---Passing along arguments---\n");
deferred.resolved("time")
  .then(function(result, extra) {
    return result + " " + extra;
  }.postbind(this, "flies"))
  
  .then(function(result) {
    return Array.prototype.slice.call(arguments).join(" ");
  }.postbind(this, "like", "an", "arrow"))
  
  .then(acre.write)
