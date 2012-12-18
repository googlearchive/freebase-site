var exports = {
  type: "module",
  description: "The HTTP response object",
  members: {
    "status" : {
      type: "number",
      description: "The HTTP status of the response."
    },
    "add_header": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The header name"
        },
        {
          name: "value",
          type: "string",
          optional: false,
          description: "The header value"
        }
      ],
      description: "Adds a response HTTP header. If there's an exiting value for the name specified, the new value will be appended."
    },
    "set_header": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The header name"
        },
        {
          name: "value",
          type: "string",
          optional: false,
          description: "The header value"
        }
      ],
      description: "Sets a response HTTP header. If there's an exiting value for the name specified, the new value will replace it."
    },
    "set_header_default": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The header name"
        },
        {
          name: "value",
          type: "string",
          optional: false,
          description: "The header value"
        }
      ],
      description: "The same as set_header, except does not overwrite an existing value."
    },
    "set_cookie": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The cookie name"
        },
        {
          name: "value",
          type: "string",
          optional: false,
          description: "The cookie value"
        },
        {
          name: "options",
          type: "obj",
          optional: true,
          description: "[TODO]"
        }
      ],
      description: "Sets a cookie."
    },
    "clear_cookie": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The cookie name"
        },
        {
          name: "options",
          type: "obj",
          optional: true,
          description: "[TODO]"
        }
      ],
      description: "Clears the given cookie."
    },
    "set_error_page": {
      type: "function",
      paramInfo: [
        {
          name: "path",
          type: "string",
          optional: false,
          description: "Require path of the handler script"
        }
      ],
      description: "Set which script to run as the error handler for just the current request."
    }
  }
};
