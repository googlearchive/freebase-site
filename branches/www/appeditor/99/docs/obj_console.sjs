var exports = {
  type: "module",
  description: "The debug console where you can log messages from your server-side Acre scripts. " +
                "These messages are visible when your scripts are viewed with the URL parameter acre.console=1",
  members: {
    "log": {
      type: "function",
      paramInfo: [
        {
          "name" : "obj",
          "type" : "obj",
          "optional" : false,
          "description" : "a javascript object to log"
        }
      ],
      description: "Writes an info message with the given object."
    },
    "debug": {
      type: "function",
      paramInfo: [
        {
          "name" : "obj",
          "type" : "obj",
          "optional" : false,
          "description" : "a javascript object to log"
        }
      ],
      description: "Writes a debug message with the given object."
    },
    "error": {
      type: "function",
      paramInfo: [
        {
          "name" : "obj",
          "type" : "obj",
          "optional" : false,
          "description" : "a javascript object to log"
        }
      ],
      description: "Writes an error message with the given object."
    },
    "info": {
      type: "function",
      paramInfo: [
        {
          "name" : "obj",
          "type" : "obj",
          "optional" : false,
          "description" : "a javascript object to log"
        }
      ],
      description: "Writes an info message with the given object."
    },
    "warn": {
      type: "function",
      paramInfo: [
        {
          "name" : "obj",
          "type" : "obj",
          "optional" : false,
          "description" : "a javascript object to log"
        }
      ],
      description: "Writes a warning message with the given object."
    }
  }
};
