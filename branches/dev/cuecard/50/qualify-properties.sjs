var callback = acre.environ.params["callback"];
var worker = acre.require("worker");

var qualificationMap = {};
var propertyMap = {};

var uniqueTypes = [];
var uniqueTypeMap = {};
worker.expandIncludedTypes(acre.environ.params["t"], acre.environ.params["i"], acre.environ.params["g"], uniqueTypes, uniqueTypeMap);

var qualificationMap = {};
var propertyMap = worker.getPropertiesOfTypes(uniqueTypes, uniqueTypeMap, function(propertyEntry) {
  var slash = propertyEntry.id.lastIndexOf("/");
  var shortID = propertyEntry.id.substr(slash + 1);
  if (!(shortID in qualificationMap)) {
    qualificationMap[shortID] = propertyEntry.id;
  }
});

acre.start_response(200);
if (callback) {
  acre.write(callback + "(");
}
acre.write(JSON.stringify({ qualifications: qualificationMap, properties: propertyMap }));
if (callback) {
  acre.write(")");
}