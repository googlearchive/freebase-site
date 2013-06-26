var exports = {
  name: "options",
  type: "obj",
  description: "The HTTP request options for an urlfetch.",
  structure: [
    {
      "name" : "method",  
      "type" : "string",
      "optional" : true,
      "description" : "An HTTP method, such as \"GET\" and \"POST\". Default is \"GET\".",
      "default" : "\"GET\""
    },
    {
      "name" : "headers",
      "type" : "obj",
      "optional" : true,
      "description" : "A Javascript object containing key/value pairs, e.g., { \"Content-Length\" : 25 }"
    },
    {
      "name" : "content",
      "type" : "string",
      "optional" : true,
      "description" : "The body of the HTTP request, applicable for POST"
    },
    {
      "name" : "sign",
      "type" : "boolean",
      "optional" : true,
      "description" : "Whether or not Acre should try to 'sign' the request using OAuth credentials set by acre.oauth.get_credentials() [defaults to 'false']"
    },
    {
      "name" : "timeout",
      "type" : "number",
      "optional" : true,
      "description" : "(Async only).  Number of ms to give the request before throwing (or calling errback with) a timeout error"
    }
  ]
};