var exports = {
  type: "module",
  description: "The dictionary of properties of the error (only present when executing an error script).",
  members: {
    "filename": {
      type: "string",
      description: "The URL of the script where the error occured."
    },
    "line": {
      type: "number",
      description: "Line number of the error."
    },
    "message": {
      type: "string",
      description: "Error message."
    },
    "info": {
      type: "obj",
      description: "Additional error information.  Format depends on the error."
    },
    "stack": {
      type: "obj",
      description: "Native javascript errors include a full stacktrace."
    }
  }
};
