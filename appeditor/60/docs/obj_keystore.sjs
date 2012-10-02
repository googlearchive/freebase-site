var exports = {
  type: "module",
  description: "Contains functions to manage and retrieve app secrets.",
  members: {
    "get": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The name of the key to get"
        }
      ],
      description: "Returns a key object associated with the given name."
    },
    "keys": {
      type: "function",
      paramInfo: [],
      description: "Returns an array of key names that belong to the current ACRE app."
    },
    "remove": {
      type: "function",
      paramInfo: [
        {
          name: "name",
          type: "string",
          optional: false,
          description: "The name of the key to remove"
        }
      ],
      description: "Removes the key associated with the given name."
    },
    "get_project": {
      type: "function",
      description: "Returns the project identifier for the currently active keystore.  'project' is setable in app metadata, however, current app must be a subdomain of the project."
    }
  }
};
