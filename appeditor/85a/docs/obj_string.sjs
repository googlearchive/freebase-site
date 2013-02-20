var exports = {
  type: "module",
  description: "Javascript String object",
  members: { 
    length: {
      type: "number",
      description: "The length of the string."
    },
    charAt: {
      type: "function",
      paramInfo: [
        {
          name: "index",
          type: "number",
          optional: false,
          description: "The position to look up"
        }
      ],
      description: "Returns the character at the given position."
    },
    indexOf: {
      type: "function",
      paramInfo: [
        {
          name: "searchString",
          type: "string",
          optional: false,
          description: "The text string to look for."
        },
        {
          name: "startingIndex",
          type: "number",
          optional: true,
          description: "The position from where to start looking."
        }
      ],
      description: "returns the position where searchString first occurs in str. If not present -1 is returned. Optionally, you can specify the starting point from where the search should start."
    },
    lastIndexOf: {
      type: "function",
      paramInfo: [
        {
          name: "searchString",
          type: "string",
          optional: false,
          description: "The text string to look for."
        },
        {
          name: "startingIndex",
          type: "number",
          optional: true,
          description: "The position from where to start looking."
        }
      ],
      description: "Returns the position where searchString last occurs in str. If not present -1 is returned. Optionally, you can specify the starting point from where the search should start."
    },
    match: {
      type: "function",
      paramInfo: [
        {
          name: "regularExpression",
          type: "regexp",
          optional: false,
          description: "The regular expression to match."
        }
      ],
      description: "Returns true if the string matches regularExpression. For example, 'abc'.matches(/a*c/) returns true."
    },
    search: {
      type: "function",
      paramInfo: [
        {
          name: "regularExpression",
          type: "regexp",
          optional: false,
          description: "The regular expression to search."
        }
      ],
      description: "Returns the zero-based index value of the first character in the string that matches the given regular expression."
    },
    replace: {
      type: "function",
      paramInfo: [
        {
          name: "regularExpression",
          type: "regexp",
          optional: false,
          description: "The regular expression to match."
        },
        {
          name: "replacementString",
          type: "string",
          optional: false,
          description: "The replacement string."
        }
      ],
      description: "Returns a modified version of the string where all parts that matched the regular expression where substituted with the given replacement string."
    },
    split: {
      type: "function",
      paramInfo: [
        {
          name: "delimiter",
          type: "string",
          optional: false,
          description: "The delimiting text."
        },
        {
          name: "limitInteger",
          type: "number",
          optional: true,
          description: "The position from where to start looking."
        }
      ],
      description: "Splits the string into an array of strings by separating the string delimited by the delimiter."
    },
    substr: {
      type: "function",
      paramInfo: [
        {
          name: "startIndex",
          type: "number",
          optional: false,
          description: ""
        },
        {
          name: "length",
          type: "number",
          optional: true,
          description: ""
        }
      ],
      description: "Returns a fragment of str taken from the character at position startIndex until the end of the original string. In case length is specified, the fragment contains that many characters."
    },
    substring: {
      type: "function",
      paramInfo: [
        {
          name: "startIndex",
          type: "number",
          optional: false,
          description: ""
        },
        {
          name: "endIndex",
          type: "number",
          optional: true,
          description: ""
        }
      ],
      description: "Returns a fragment of the string taken from the character at position startIndex until the end of the original string. In case endIndex is specified, the fragment ends with the character at that position."
    },
    toLowerCase: {
      type: "function",
      paramInfo: [],
      description: "Returns a modified copy of str with all the characters turned into lower case."
    },
    toUpperCase: {
      type: "function",
      paramInfo: [],
      description: "Returns a modified copy of str with all the characters turned into uppper case."
    }
  }
};
