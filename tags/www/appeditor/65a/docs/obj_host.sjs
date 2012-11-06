var exports = {
  type: "module",
  description: "Contains information about the Acre host server.",
  members: {
    "dev_name": {
      type: "string",
      description: "The development subdomain name of the Acre host."
    },
    "name": {
      type: "string",
      description: "The domain name of the Acre host."
    },
    "port": {
      type: "string",
      description: "The network port the Acre host accepted the request on."
    },
    "protocol": {
      type: "string",
      description: "The network protocol the Acre host accepted the request on."
    },
    "server": {
      type: "string",
      description: "The type of Acre server (e.g., 'jetty' or 'appengine')."
    }
  }
};
