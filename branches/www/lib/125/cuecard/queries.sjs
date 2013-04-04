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

var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var deferred = apis.deferred;
var urlfetch = apis.urlfetch;
var freebase = apis.freebase;


function expandIncludedTypes(typesString, idsString, guidsString, typeArray, typeMap) {

  var promises = [];

  function enterUniqueType(type, explicit) {
    if (!(type in typeMap)) {
      typeMap[type] = { index: typeArray.length, explicit: explicit }; // we'll use this later for sorting
      typeArray.push(type);
    }
  }

  function enterUniqueTypes(types, explicit) {
    for (var i = 0; i < types.length; i++) {
      enterUniqueType(types[i], explicit);
    }
  }

  if (typesString !== undefined && typesString.length > 0) {
    enterUniqueTypes(typesString.split(","), true);
  }

  if (idsString !== undefined && idsString.length > 0) {
    promises.push(freebase.mqlread([{
        "type" : "/type/type",
        "id" : null,
        "instance" : [{ "id|=" : idsString.split(",") }]
      }]).then(function(env) {
        return env.result;
      }).then(function(r) {
        for (var i = 0; i < r.length; i++) {
          enterUniqueType(r[i].id, false);
        }
        return r;
      })
    );
  }

  if (guidsString !== undefined && guidsString.length > 0) {
    promises.push(freebase.mqlread([{
        "type" : "/type/type",
        "id" : null,
        "instance" : [{ "guid|=" : guidsString.split(",") }]
      }]).then(function(env) {
        return env.result;
      }).then(function(r) {
        for (var i = 0; i < r.length; i++) {
          enterUniqueType(r[i].id, false);
        }
        return r;
      })
    );
  }

  return deferred.all(promises)
    .then(function() {
       //Get all the included types.
      if (typeArray.length > 0) {
        promises.push(freebase.mqlread(
            acre.freebase.extend_query(
              acre.require("cuecard/included-types").query,
              { "id|=" : typeArray }
            )
          ).then(function(env) {
            return env.result;
          }).then(function(r) {
            for (var i = 0; i < r.length; i++) {
              var entry = r[i];
              if ("/freebase/type_hints/included_types" in entry && entry["/freebase/type_hints/included_types"] != null) {
                var a = entry["/freebase/type_hints/included_types"];
                for (var j = 0; j < a.length; j++) {
                  enterUniqueType(a[j].id, false);
                }
              }
            }
          })
        );
      }
    })
    .then(function() {
      enterUniqueType("/type/object", true);
    })
}


var valueTypes = {
  '/type/int': true,
  '/type/float': true,
  '/type/boolean': true,
  '/type/rawstring': true,
  '/type/uri': true,
  '/type/datetime': true,
  '/type/bytestring': true,
  '/type/id': true,
  '/type/key': true,
  '/type/value': true
};

function getPropertiesOfTypes(types, typeMap, visitor) {
  var propertyMap = {};

  return freebase.mqlread(
      acre.freebase.extend_query(
        acre.require("cuecard/properties-query").query,
        { "id|=" : types }
      )
    )
    .then(function(env) {
      return env.result;
    })
    .then(function(r) {
      r.sort(function(a, b) {
        return typeMap[a.id].index - typeMap[b.id].index;
      });

      var hasValueType = false;
      for (var i = 0; i < r.length; i++) {
        var typeEntry = r[i];
        if (typeEntry.id in valueTypes) {
          hasValueType = true;
        }

        if ("properties" in typeEntry && typeEntry.properties != null) {
          var explicit = (typeEntry.id in typeMap && "explicit" in typeMap[typeEntry.id]) ? typeMap[typeEntry.id].explicit : true;

          var propertyEntries = typeEntry.properties;
          propertyEntries.sort(function(a, b) {
            return a.id.localeCompare(b.id);
          });

          for (var j = 0; j < propertyEntries.length; j++) {
            var propertyEntry = propertyEntries[j];
            var expectedTypes = "expected_type" in propertyEntry ? propertyEntry.expected_type : [];

            var result;
            if (propertyEntry.id in propertyMap) {
              result = propertyMap[propertyEntry.id];
            } else {
              result = propertyMap[propertyEntry.id] = {
                expectedTypes: [],
                explicit: explicit,
                unique: "unique" in propertyEntry ? propertyEntry.unique : false
              };
              visitor(propertyEntry);
            }

            for (var x = 0; x < expectedTypes.length; x++) {
              var t = expectedTypes[x];
              result.expectedTypes.push(t);

              if ("/freebase/type_hints/mediator" in t) {
                t.isCVT = t["/freebase/type_hints/mediator"] === true;
                delete t["/freebase/type_hints/mediator"];
              }
            }
          }
        }
      }

      if (hasValueType) {
        propertyMap["value"] = {
          expectedTypes: [],
          explicit: true,
          unique: true
        };
      }
    })
    .then(function() {
      return propertyMap;
    });
}


function addCVTProperties(properties, uniqueTypes, uniqueTypeMap) {
  var cvtProperties = {};
  var promises = [];

  for (var propertyID in properties) {
    var expectedTypes = properties[propertyID].expectedTypes;
    for (var t = 0; t < expectedTypes.length; t++) {
      var expectedType = expectedTypes[t];
      if (expectedType["isCVT"]) {
        promises.push(getPropertiesOfTypes([ expectedType.id ], uniqueTypeMap, function() {})
          .then(function(properties2) {
            for (var propertyID2 in properties2) {
              if (!(propertyID2 in cvtProperties)) {
                var propertyEntry = properties2[propertyID2];
                propertyEntry.parentProperty = propertyID;
                cvtProperties[propertyID2] = propertyEntry;
              }
            }
          })
        );
      }
    }
  }

  return deferred.all(promises)
    .then(function() {
      for (var n in cvtProperties) {
        properties[n] = cvtProperties[n];
      }
    });
}


function qualify_properties(typesString, idsString, guidsString) {
  var qualificationMap = {};
  var propertyMap = {};

  var uniqueTypes = [];
  var uniqueTypeMap = {};

  return expandIncludedTypes(typesString, idsString, guidsString, uniqueTypes, uniqueTypeMap)
    .then(function() {
      var qualificationMap = {};
      return getPropertiesOfTypes(uniqueTypes, uniqueTypeMap, function(propertyEntry) {
        var slash = propertyEntry.id.lastIndexOf("/");
        var shortID = propertyEntry.id.substr(slash + 1);
        if (!(shortID in qualificationMap)) {
          qualificationMap[shortID] = propertyEntry.id;
        }
      });
    })
    .then(function(propertyMap) {
      return { qualifications: qualificationMap, properties: propertyMap };
    });
}


function suggest_properties(property, reverse, typesString, idsString, guidsString) {
  var uniqueTypes = [];
  var uniqueTypeMap = {};
  var promises = [];

  if (property && property.length > 0) {
    if (reverse) {
      var slash = property.lastIndexOf("/");
      var type = property.substr(0, slash);

      uniqueTypeMap[type] = { index: uniqueTypes.length, explicit: true };
      uniqueTypes.push(type);
    } else {
      promises.push(freebase.mqlread({
        "id" : property,
        "type" : "/type/property",
        "expected_type" : [{ "id" : null, "name" : null }]
        }).then(function(env) {
         return env.result;
        }).then(function(r) {
          if ("expected_type" in r && r.expected_type != null) {
            var expectedTypes = r.expected_type;
            for (var i = 0; i < expectedTypes.length; i++) {
              var expectedType = expectedTypes[i];
              uniqueTypeMap[expectedType.id] = { index: uniqueTypes.length, explicit: true };
              uniqueTypes.push(expectedType.id);
            }
          }
        })
      );
    }
  }

  return deferred.all(promises)
    .then(function() {
      return expandIncludedTypes(typesString, idsString, guidsString, uniqueTypes, uniqueTypeMap);
    })
    .then(function() {
      if (uniqueTypes.length == 0) {
        uniqueTypes.push("/type/object");
        uniqueTypeMap["/type/object"] = { index: 0, explicit: true };
      }
    })
    .then(function() {
      return getPropertiesOfTypes(uniqueTypes, uniqueTypeMap, function(){});
    })
    .then(function(properties) {
      return addCVTProperties(properties, uniqueTypes, uniqueTypeMap)
        .then(function() {
          return { properties: properties };
        });
    });
}


function suggest_arbitrary_properties(query) {
  var infoQ = [{
    "id" : null,
    "guid" : null,
    "name" : null,
    "key" : [],
    "/type/property/schema" : [{
      "id" : null,
      "name" : null,
      "optional" : true
    }],
    "/type/property/expected_type" : [],
    "/type/property/unique" : null
  }];

  return freebase.search(query + "*", {
      type:        "/type/property",
      type_strict: "any",
      limit:       "10",
      mql_output:  JSON.stringify(infoQ)
  })
    .then(function(o) {
      if (query.charAt(0) == "/") {
        acre.freebase.extend_query(infoQ, {"id":query});
        return freebase.mqlread(infoQ)
          .then(function(o2) {
            if (o2.result.length > 0) {
              return o.result.unshift(o2.result[0]);
            } else {
              return o.result;
            }
          }, 
          function(e) {
            console.log(e);
            return [];
          });
      } else {
        return o.result;
      }
    });
}


function suggest_values_of_types(query, typeId) {
  var infoQ = [{
    "id" : null,
    "guid" : null,
    "name" : null,
    "/common/topic/image" : [{ "optional" : true, "id" : null, "limit" : 1 }]
  }];

  var options = {
    limit: "10",
    mql_output: JSON.stringify(infoQ)
  };

  if (typeId.length > 0) {
    options.type = typeId;
    options.type_strict = 'any';
  }

  return freebase.search(query + "*", options)
    .then(function(o) {
      if (query.charAt(0) == "/") {
        acre.freebase.extend_query(infoQ, {"id":query});
        return freebase.mqlread(infoQ)
          .then(function(o2) {
            if (o2.result.length > 0) {
              return o.result.unshift(o2.result[0]);
            } else {
              return o.result;
            }
          }, 
          function(e) {
            console.log(e);
            return [];
          });
      } else {
        return o.result;
      }
    });

}
