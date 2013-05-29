var exports = {
  type: "module",
  description: "Contains utility functions for generating hashes.",
  members: {
    hex_sha1: {
      type: "function",
      paramInfo: [
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a HEX encoded SHA-1 hash of the given string."
    },
    hex_hmac_sha1: {
      type: "function",
      paramInfo: [
        {
          name: "key",
          type: "string",
          optional: false,
          description: "The key"
        },
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a HEX encoded HMAC of the given key, value pair using SHA-1 to hash them."
    },
    b64_sha1: {
      type: "function",
      paramInfo: [
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a base64 encoded SHA-1 hash of the given string."
    },
    b64_hmac_sha1: {
      type: "function",
      paramInfo: [
        {
          name: "key",
          type: "string",
          optional: false,
          description: "The key"
        },
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a base64 encoded HMAC of the given key, value pair using SHA-1 to hash them."
    },
    
    hex_md5: {
      type: "function",
      paramInfo: [
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a HEX encoded MD5 hash of the given string."
    },
    hex_hmac_md5: {
      type: "function",
      paramInfo: [
        {
          name: "key",
          type: "string",
          optional: false,
          description: "The key"
        },
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a HEX encoded HMAC of the given key, value pair using MD5 to hash them."
    },
    b64_md5: {
      type: "function",
      paramInfo: [
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a base64 encoded MD5 hash of the given string."
    },
    b64_hmac_md5: {
      type: "function",
      paramInfo: [
        {
          name: "key",
          type: "string",
          optional: false,
          description: "The key"
        },
        {
          name: "data",
          type: "string",
          optional: false,
          description: "The string to hash"
        }
      ],
      description: "Generates a base64 encoded HMAC of the given key, value pair using MD5 to hash them."
    }
  }
};
