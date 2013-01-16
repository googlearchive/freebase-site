var exports = {
  type: "module",
  description: "Contains utility functions to deal with markup generation (mostly useful inside Acre templates).",
  members: {
    "bless": {
      type: "function",
      paramInfo: [
        {
          name: "html_code",
          type: "string",
          optional: false,
          description: "The HTML code to inject into the HTTP response"
        }
      ],
      description: "Allows direct injection of markup into a template (and performs XSS sanitation)."
    },
    "stringify": {
      type: "function",
      paramInfo: [
        {
          name: "template_obj",
          type: "obj",
          optional: false,
          description: "The output of an ACRE template or of an ACRE template function"
        }
      ],
      description: "Flattens the tree representation of an ACRE template output into a Javascript string."
    }
  }
};
