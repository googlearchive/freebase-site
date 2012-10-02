var exports = {
  type: "module",
  description: "The HTTP request object and information on the script and app associated to that request.",
  members: {
    "headers": {
      type: "hash",
      description: "The dictionary of HTTP headers of the request."
    },
    "cookies": {
      type: "hash",
      description: "The dictionary of HTTP cookies of the request."
    },
    "params": {
      type: "hash",
      description: "The dictionary of the request parameters."
    },
    "body_params": {
      type: "hash",
      description: "The dictionary of HTTP POST body parameters of the request."
    },
    "path_info": {
      type: "string",
      description: "The part of the URL path after the script name."
    },
    "query_string": {
      type: "string",
      description: "The part of the URL after ?"
    },
    "body": {
      type: "string",
      description: "The body of the request (POST requests only)."
    },
    "method": {
      type: "string",
      description: "The HTTP method used to request the script."
    },
    "app_url": {
      type: "string",
      description: "The base URL of the request (basically http://host)."
    },
    "url": {
      type: "string",
      description: "The full request URL that was used to request the script."
    },
    "server_name": {
      type: "string",
      description: "The host that was originally called to request the script."
    },
    "server_port": {
      type: "string",
      description: "The port that was originally called to request the script."
    },
    "start_time": {
      type: "string",
      description: "The time the request started."
    },
    
    "script": {
      "type": "obj",
      "description": "The script that gets executed first to respond to the HTTP request",
      "structure": {
        "app": {
          "type": "obj",
          "description": "The Acre app containing the script that gets executed first to respond to the HTTP request",
          "structure" : {
            "path": {
              type: "string",
              description: "The URL of the acre app that contains the script."
            },
            "mounts" : {
              type: "obj",
              description: "The current mount points for the app."
            },
            "version": {
              type: "string",
              description: "The version of the script."
            },
            "host": {
              type: "string",
              description: "The hostname for the app."
            },
            "base_url": {
              type: "string",
              description: "The full base URL for this application."
            },
            "source": {
              type: "string",
              description: "The appfetcher used to retrieve the app (e.g., 'freebase' or 'disk')."
            },
          }
        },
        "name": {
          type: "string",
          description: "The name of the script first executed by the request."
        },
        "path": {
          type: "string",
          description: "The URL of the script first executed by the request."
        },
        "content_id": {
          type: "string",
          description: "The ID of the content of the script first executed by the request."
        },
        "content_hash": {
          type: "string",
          description: "Unique identifier of the version of the script."
        },
        "handler": {
          type: "string",
          description: "The handler that executed the script."
        },
        "source": {
          type: "string",
          description: "The appfetcher used to retrieve the script (e.g., 'freebase' or 'disk')."
        },
        "media_type": {
          type: "string",
          description: "The MIME type of the content the script produced."
        }
      }
    }
  }
};

