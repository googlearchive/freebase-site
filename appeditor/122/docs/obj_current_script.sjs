var exports = {
  type: "module",
  description: "Contains information on scripts currently being executed (and potentially invoked by other scripts).",
  members: {
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
};
