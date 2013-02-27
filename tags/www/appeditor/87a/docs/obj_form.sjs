var exports = {
  type: "module",
  description: "Contains utility functions for dealing with HTML forms.",
  members: {
    "build_url": {
      type: "function",
      paramInfo: [
        {
          "name" : "base_url",
          "type" : "string",
          "optional" : false,
          "description" : "the base URL"
        },
        {
          "name" : "url_parameters",
          "type" : "obj",
          "optional" : false,
          "description" : "A Javascript object whose properties are the URL parameter names and values to encode"
        }
      ],
      description: "Constructs a url by appending a query string, constructed from the given Javascript object, to a base url."
    },
    
    "quote": {
      type: "function",
      paramInfo: [
        {
          "name" : "text",
          "type" : "string",
          "optional" : false,
          "description" : "The text to quote"
        }
      ],
      description: "Like encodeURIComponent, but quotes fewer characters (so resulting strings are more compact)."
    },
    
    "encode": {
      type: "function",
      paramInfo: [
        {
          "name" : "parameters",
          "type" : "obj",
          "optional" : false,
          "description" : "A Javascript object whose properties are the parameter names and values to encode"
        }
      ],
      description: "Generates a www-form-urlencoded string from an object. Undefined values are skipped, but empty strings are included."
    },
    
    "decode": {
      type: "function",
      paramInfo: [
        {
          "name" : "encoded_text",
          "type" : "string",
          "optional" : false,
          "description" : "The www-form-urlencoded string that to decode"
        }
      ],
      description: "Parses a www-form-urlencoded string into a Javascript object."
    },

    "csrf_protect": {
      type: "function",
      description: "Convenience method for protecting FORMS in Acre templates.  " + 
                    "When called, inserts a hidden input for ACRE_CSRF_TOKEN, automatically protecting the form " +
                    "(depending on the csrf_protection setting in METADATA).",
    },

    "generate_csrf_token": {
      type: "function",
      paramInfo: [
        {
          "name" : "timeout",
          "type" : "number",
          "optional" : true,
          "description" : "How long the token should be valid, in seconds."
        }
      ],
      description: "Generates a token to use as the ACRE_CSRF_TOKEN param on subsequent requests."
    },

    "validate_csrf_token": {
      type: "function",
      paramInfo: [
        {
          "name" : "token",
          "type" : "string",
          "optional" : false,
          "description" : "The token to check."
        }
      ],
      description: "Check whether a token is still valid."
    }

  }
};
