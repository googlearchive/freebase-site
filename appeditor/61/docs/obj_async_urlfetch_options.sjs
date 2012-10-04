var exports = {
  name: "options",
  type: "obj",
  description: "The HTTP request options for an async urlfetch.",
  structure: [
    {
      "name" : "callback",  
      "type" : "function",
      "optional" : true,
      "description" : "The function to call with response object if successful."
    },
    {
      "name" : "errback",  
      "type" : "function",
      "optional" : true,
      "description" : "The function to call with response object if successful."
    },
    {
      "name" : "timeout",
      "type" : "number",
      "optional" : true,
      "description" : "Number of ms to give the request before throwing (or calling errback with) a timeout error"
    }
  ].concat(acre.require("./obj_urlfetch_options").exports.structure),
};
