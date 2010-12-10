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