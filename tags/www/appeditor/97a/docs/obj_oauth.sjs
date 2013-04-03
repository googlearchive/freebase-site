var exports = {
  type: "module",
  description: "Provides Open Authentication (OAuth) functionalities.",
  members: {
    get_authorization: {
      type: "function",
      paramInfo: [
        {
          name: "provider",
          type: "string",
          optional: true,
          description: "The name of the OAuth provider."
        },
        {
          name: "success_url",
          type: "string",
          optional: true,
          description: "The URL to redirect the user in case of a successful OAuth authorization."
        },
        {
          name: "failure_url",
          type: "string",
          optional: true,
          description: "The URL to redirect the user in case of a failed OAuth authorization."
        }      
      ],
      description: "Performs the OAuth dance with the given provider (if omitted, the default provider is Freebase)."
    },
    has_credentials: {
      type: "function",
      paramInfo: [
        {
          name: "provider",
          type: "string",
          optional: true,
          description: "The name of the OAuth provider"
        }
      ],
      description: "Checks if the user has the given provider's OAuth credentials in his/her cookies (if omitted, the default provider is Freebase)."
    },
    remove_credentials: {
      type: "function",
      paramInfo: [
        {
          name: "provider",
          type: "string",
          optional: true,
          description: "The name of the OAuth provider"
        }
      ],
      description: "Removes OAuth credentials with the given provider from the user's cookies (if omitted, the default provider is Freebase)."
    },
    providers: {
      type: "array",
      description: "A convenient list of OAuth providers."
    }
  }
};
