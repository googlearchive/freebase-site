var exports = {
  type: "module",
  description: "Functions for asynchronously fetching URLs.  Useful for doing parallel requests.",
  members: {
    "urlfetch": {
      type: "function",
      paramInfo: [
        {
          "name" : "url",
          "type" : "string",
          "optional" : false,
          "description" : "A valid publicly accessible URL"
        }
      ].concat([acre.require("./obj_async_urlfetch_options").exports]),
      description: "Fetches the given url using the given HTTP method, headers, and content as payload."
    },
    "wait_on_results": {
      type: "function",
      paramInfo: [
        {
          "name" : "timeout",
          "type" : "number",
          "optional" : true,
          "description" : "Deadline for request to complete (in milliseconds)."
        }
      ],
      description: "Blocks until all asynchronous requests have completed"
    }
  }
};

