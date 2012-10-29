var exports = {
  type: "module",
  description: "METADATA files specify the configuration for an app.  They can come in one of two forms: 1/METADATA.json - contains raw JSON, or 2/METADATA.sjs - must contain a top-level 'METADATA' object. " +
               "These files can specify arbitrary metadata, but the following values are used by Acre itself.",
  members: {
    project: {
      type: "string",
      description: "Specifies the hostname of the keystore.  Defaults to the app hostname, but a higher-level domain can be specified in order to share a keystore across apps."
    },
    error_page: {
      type: "string",
      description: "URL path specifying a custom renderer for errors."
    },
    not_found_page: {
      type: "string",
      description: "URL path specifying a custom renderer for when no script is found."
    },
    csrf_protection: {
      type: "string",
      description: "Prevent state-changing urlfetches if the top-level request is not secure (uses GET or HEAD).  The 'bless' option to urlfetch can be used to override this setting.",
      choices: {
        "false": "No CSRF protection. The default.",
        "true": "Require x-requested-with header to be present in initial request and only non-GET or HEAD subrequests are allowed.",
        "\"strong\"": "Same behavior as true, but also requires a valid ACRE_CSRF_TOKEN param to be present in the request (see acre.form).",
      }
    },
    ttl: {
      type: "number",
      description: "Time in milliseconds to cache this app METADATA.  A negative value means to cache permanently."
    },
    handlers: {
      type: "hash",
      description: "A dictionary keyed by handler name that specifies additional handlers to load to acre.handlers.  Values are the URL to a script that defines the handler.",
    },
    extensions: {
      type: "hash",
      description: "A dictionary keyed by extension.  Each value is an object with the following structure:",
      structure: [
        {
          name: "media_type",
          type: "string",
          optional: true,
          description: "The default mime-type to return for files with this extension."
        },
        {
          name: "handler",
          type: "string",
          optional: true,
          description: "the handler key to use for files with this extension."
        }
      ]
    }
  }
};
