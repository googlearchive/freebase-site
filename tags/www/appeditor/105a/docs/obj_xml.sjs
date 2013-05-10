var exports = {
  type: "module",
  description: "Contains XML processing functions.",
  members: {
    "parse": {
      type: "function",
      paramInfo: [
        {
          name: "xml_content",
          type: "string",
          optional: false,
          description: "The XML string to parse"
        }
      ],
      description: "Parses a string containing an XML page and generates a DOM representation of it."
    },
    "parseNS": {
      type: "function",
      paramInfo: [
        {
          name: "xml_content",
          type: "string",
          optional: false,
          description: "The XML string to parse"
        }
      ],
      description: "Same as acre.xml.parse, but with namespace support turned on."
    }
  }
};
