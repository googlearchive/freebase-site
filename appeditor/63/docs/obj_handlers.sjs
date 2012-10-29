var exports = {
  type: "module",
  description: "The registry of currently active handlers.  Custom handlers are loaded by specifying their scripts in METADATA. " +
  			    "Handler scripts must have a top-level 'handler' object with the following methods:",
  members: {
    "to_js": {
      type: "function",
      description: "Required.  Given the script object to handle, return the raw JS to compile and cache.",
      paramInfo: [
        {
          name: "script",
          type: "obj",
          description: "The script object.  Contents of a script are retrieved using its get_content() method.  Other properties are similar to acre.current_script."
        }
      ]
    },
    "augment_scope": {
      type: "function",
      description: "Optional.  Decorate the scope the script will be executed in beforehand.",
      paramInfo: [
        {
          name: "scope",
          type: "obj",
          description: "The scope object to decorate.  Scope will already contain the context-bound acre.* methods."
        },
        {
          name: "script",
          type: "obj",
          description: "The script object."
        }
      ]
    },
    "to_module": {
      type: "function",
      description: "Required. Given compiled Javascript, produce the final module to be returned by acre.require().",
      paramInfo: [
        {
          name: "compiled_js",
          type: "obj",
          description: "The result of the to_js() compiled using the result of the augment_scope() method as the scope."
        },
        {
          name: "script",
          type: "obj",
          description: "The script object.  The scope is now available at script.scope, if you need to do relative requires, for example."
        }
      ]
    },
    "to_http_response": {
      type: "function",
      description: "Required. Convert a module to an HTTP response object with 'status', 'headers' and 'body'.  " + 
      				"This method is what's run on the top-level request script.  The 'body' property is also what's returned by acre.include().",
      paramInfo: [
        {
          name: "module",
          type: "obj",
          description: "The module returned by to_module()."
        },
        {
          name: "script",
          type: "obj",
          description: "The script object."
        }
      ]
    }
  }
}