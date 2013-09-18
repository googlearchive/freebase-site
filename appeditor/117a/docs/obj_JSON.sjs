var exports = {
  type: "module",
  description: "Contains JSON processing functionalities.",
  members: {
    parse: {
      type: "function",
      paramInfo: [
        {
          "name" : "json_string",
          "type" : "string",
          "optional" : false,
          "description" : "The JSON string to parse"
        }
      ],
      description: "Parses a string containing a serialized JSON object and returns a Javascript object."
    },
    stringify: {
      type: "function",
      paramInfo: [
        {
          "name" : "object",
          "type" : "obj",
          "optional" : false,
          "description" : "The javascript object to serialize"
        },
        {
          "name" : "resolver",
          "type" : "function | string | null",
          "optional": true,
          "description" : "Used to replace an object with some string value if its encoding is unsupported (not implemented)"
        },
        {
          "name" : "indent",
          "type" : "string | number",
          "optional" : true,
          "description" : "A string to prefix before indented lines, or the number of spaces to use for each indentation level"
          }
      ],
      description: "Serializes a Javascript object into a JSON string representation."
    }
  }
};
