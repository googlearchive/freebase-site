var exports = {
  type: "module",
  description: "Contains utility functions for working with Acre templates.",
  members: {
    "load_from_string": {
      type: "function",
      paramInfo: [
        {
          name: "source",
          type: "string",
          optional: false,
          description: "The template (as string) to compile."
        },
        {
          name: "name",
          type: "string",
          optional: false,
          description: "Module name to use when compiling the template."
        }
      ],
      description: "Takes a string representation of a template and compiles it into a template package."
    },
    "string_to_js": {
      type: "function",
      paramInfo: [
        {
          name: "source",
          type: "string",
          optional: false,
          description: "The template (as string) to compile."
        },
        {
          name: "name",
          type: "string",
          optional: false,
          description: "Module name to use when compiling the template."
        }
      ],
      description: "Similar to load_from_string, except final package is serialized back to a javascript string."
    }
  }
};
