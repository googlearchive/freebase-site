var exports = {
  type: "module",
  members: {
    "request": acre.require("./obj_request").exports,
    "response": acre.require("./obj_response").exports,
    "current_script": acre.require("./obj_current_script").exports,
    "host": acre.require("./obj_host").exports,
    "error": acre.require("./obj_error").exports,

    "freebase": acre.require("./obj_freebase").exports,
    "oauth": acre.require("./obj_oauth").exports,
    "async": acre.require("./obj_async").exports,    
    "keystore": acre.require("./obj_keystore").exports,
    
    "form": acre.require("./obj_form").exports,
    "markup": acre.require("./obj_markup").exports,
    "template": acre.require("./obj_template").exports,
    "html": acre.require("./obj_html").exports,
    "xml": acre.require("./obj_xml").exports,
    "hash": acre.require("./obj_hash").exports,

    "handlers": acre.require("./obj_handlers").exports,
    
    "version": {
      type: "string",
      description: "Version of the Acre system"
    },

    "write": {
      type: "function",
      paramInfo: [
        {
          "name" : "response_text",
          "type" : "string",
          "optional" : false,
          "description" : "The text to write"
        }
      ],
      description: "Writes the given string to the HTTP response body."
    },
    
    "exit": {
      type: "function",
      paramInfo: [ ],
      description: "Abruptly terminates the execution of the script."
    },
    
    "wait": {
      type: "function",
      paramInfo: [
        {
          "name" : "milliseconds",
          "type" : "number",
          "optional" : false,
          "description" : "Pause the request."
        }
      ],
      description: "Abruptly terminates the execution of the script."
    },

    "urlfetch": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "A valid publicly accessible URL"
        }
      ].concat([acre.require("./obj_urlfetch_options").exports]),
      description: "Fetches the given url using the given HTTP method, headers, and content as payload."
    },
    
    "require": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of an Acre-hosted script, either absolute (\"http://published-host.freebaseapps.com/foo\"), relative to Acre (\"//published-host/foo\" or \"//appY.userX.user.dev/foo\"), or relative to the file (\"foo\")."
        },
        {
          "name" : "metadata",
          "type" : "object",
          "optional" : true,
          "description" : "Overrides for the required file's app METADATA."
        }
      ],
      description: "Loads the script with the given URL and returns the loaded script as an object."
    },
    
    "include": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of a template"
        },
        {
          "name" : "metadata",
          "type" : "object",
          "optional" : true,
          "description" : "Overrides for the required file's app METADATA."
        }
      ],
      description: "Includes the output of a template inline.  Currently, only works for templates. "
    },

    "route": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The Acre-hosted URL to route to... can include path and params."
        },
        {
          "name" : "body",
          "type" : "string",
          "optional" : true,
          "description" : "The value for acre.request.body to pass to the routed script."
        },
        {
          "name" : "skip_routes",
          "type" : "bool",
          "optional" : true,
          "description" : "Whether to skip the routes file, if present, in the routed app.  Defaults to 'true' when routing within the same app and 'false' otherwise."
        }
      ],
      description: "Routes the request to the given URL, but does not change the user-visible URL"
    },

    "resolve": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of an Acre-hosted script, either absolute (\"http://published-host.freebaseapps.com/foo\"), relative to Acre (\"//published-host/foo\" or \"//appY.userX.user.dev/foo\"), or relative to the file (\"foo\")."
        }
      ],
      description: "Returns the fully-qualified path if the URL resovles to a valid resource and returns null otherwise."
    },

    "get_source": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of an Acre-hosted script, either absolute (\"http://published-host.freebaseapps.com/foo\"), relative to Acre (\"//published-host/foo\" or \"//appY.userX.user.dev/foo\"), or relative to the file (\"foo\")."
        },
        {
          "name" : "metadata",
          "type" : "object",
          "optional" : true,
          "description" : "Overrides for the required file's app METADATA."
        }
      ],
      description: "Returns the raw contents of the resource."
    },

    "get_metadata": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of an app",
          "default" : "the current app"
        }
      ],
      description: "Returns the metadata for an app, including the list of files."
    },

    "mount": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "The URL of an Acre app."
        },
        {
          "name" : "local_path",
          "type" : "string",
          "optional" : false,
          "description" : "The local mount point to use for the app."
        }
      ],
      description: "Mount a version of an app so the files can be required using a local mount point.  For example, mount //2.app.joe.user.dev to 'app' to require 'app/file1'."
    }

  }
};
