var exports = {
  type: "module",
  description: "Contains HTML processing functions.",
  members: {
    "parse": {
      type: "function",
      paramInfo: [
        {
          name: "html_text",
          type: "string",
          optional: false,
          description: "The string to parse"
        }
      ],
      description: "Parses a string containing an HTML page and generates a DOM representation of it."
    },
    "encode": {
      type: "function",
      paramInfo: [
        {
          "name" : "html_text",
          "type" : "string",
          "optional" : false,
          "description" : "The HTML text to encode"
        }
      ],
      description: "Substitutes HTML entities in the string as necessary."
    }
  }
};
