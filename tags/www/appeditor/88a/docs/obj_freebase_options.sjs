var exports = {
  type: "module",
  description: "The HTTP request object and information on the script and app associated to that request.",
  structure: [
    {
      "name" : "callback",  
      "type" : "function",
      "optional" : true,
      "description" : "The function to call with response object if successful.  If present, automatically causes call to be made asynchronously."
    },
    {
      "name" : "errback",  
      "type" : "function",
      "optional" : true,
      "description" : "The function to call with error object if failure.  If present, automatically causes call to be made asynchronously."
    },
    {
      "name" : "touch",
      "type" : "boolean",
      "optional" : true,
      "description" : "Get a new dateline before the request (bust any MQL caching)."
    },
    {
      "name" : "http_timeout",
      "type" : "number",
      "optional" : true,
      "description" : "Number of ms to give the request before throwing (or calling errback with) a timeout error"
    }
  ]
};
