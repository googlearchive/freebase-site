var exports = {
  type: "module",
  description: "The Global scope",
  members: {
    "acre" : acre.require("./obj_acre").exports,
    "console" : acre.require("./obj_console").exports,
    "JSON" : acre.require("./obj_JSON").exports,
    "METADATA": acre.require("./obj_metadata").exports,
    
    eval: {
      type: "function",
      paramInfo: [ 
        {
          name: "code",
          type: "string",
          optional: false,
          description: "The code string to evaluate"
        }
      ],
      description: "Evaluates a string of Javascript code."
    },
    parseInt: {
      type: "function",
      paramInfo: [
        {
          name: "text",
          type: "string",
          optional: false,
          description: "The text string to parse"
        }
      ],
      description: "Parses a string into an integer number."
    },
    parseFloat: {
      type: "function",
      paramInfo: [
        {
          name: "text",
          type: "string",
          optional: false,
          description: "The text string to parse"
        }
      ],
      description: "Parses a string into a floating number."
    },
    encodeURI: {
      type: "function",
      paramInfo: [
        {
          name: "uri",
          type: "string",
          optional: false,
          description: "The URI to encode"
        }
      ],
      description: "Encodes a URI by replacing each instance of certain characters by one, two, or three escape sequences representing the UTF-8 encoding of the character."
    },
    decodeURI: {
      type: "function",
      paramInfo: [
        {
          name: "uri",
          type: "string",
          optional: false,
          description: "The URI to decode"
        }
      ],
      description: "Decodes a URI previously created by encodeURI."
    },
    encodeURIComponent: {
      type: "function",
      paramInfo: [
        {
          name: "uri_component",
          type: "string",
          optional: false,
          description: "The URI component to encode"
        }
      ],
      description: "Encodes a URI component by replacing each instance of certain characters by one, two, or three escape sequences representing the UTF-8 encoding of the character."
    },
    decodeURIComponent: {
      type: "function",
      paramInfo: [
        {
          name: "uri_component",
          type: "string",
          optional: false,
          description: "The URI component to decode"
        }
      ],
      description: "Decodes a URI component previously created by encodeURIComponent."
    },
    escape: {
      type: "function",
      paramInfo: [
        {
          name: "text",
          type: "string",
          optional: false,
          description: "The string to escape"
        }
      ],
      description: "Encodes a string to the form suitable for transmission as part of a URI."
    },
    unescape: {
      type: "function",
      paramInfo: [
        {
          name: "text",
          type: "string",
          optional: false,
          description: "The string to escape"
        }
      ],
      description: "Decodes a string previously created by escape."
    }
  }
};

