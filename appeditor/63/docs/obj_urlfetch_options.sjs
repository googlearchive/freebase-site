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
      "name" : "response_encoding",
      "type" : "string",
      "optional" : true,
      "description" : "Specifies the encoding to use when processing the response."
    },
    {
      "name" : "no_redirect",
      "type" : "boolean",
      "optional" : true,
      "description" : "If true, disables automatic following of redirects."
    },
    {
      "name" : "sign",
      "type" : "boolean",
      "optional" : true,
      "description" : "The method to use for signing a request (e.g., 'keystore', or 'cookie') as specified in the OAuth provider description. "
    },
    {
      "name" : "bless",
      "type" : "boolean",
      "optional" : true,
      "description" : "If true, overrides any CSRF protection that may be on."
    }
  ]
};