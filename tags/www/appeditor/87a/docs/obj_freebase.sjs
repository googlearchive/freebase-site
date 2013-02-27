var exports = {
  type: "module",
  description: "Contains information and utility functions for the Freebase service.",
  members: {
    "service_url": {
      type: "string",
      description: "The URL for Freebase APIs used by the Acre server."
    },
    "set_service_url" : {
      type: "function",
      paramInfo: [
        {
          "name" : "service_url",
          "type" : "string",
          "optional" : false,
          "description" : "The host URL that serves the freebase API (e.g. 'http://www.freebase.com')"
        }
      ],
      description: "Set the service url for all subsequent calls that use it (such as mqlread/mqlwrite).  It's important to use this call rather than trying to set acre.freebase.service_url directly as the latter method does not correctly re-set OAuth."
    },
    "site_host": {
      type: "string",
      description: "The URL for the Freebase web site (i.e., where App Editor resides)."
    },
    
    "mqlread": {
      type: "function",
      paramInfo: [
        {
          "name" : "mql_query",
          "type" : "obj",
          "optional" : false,
          "description" : "The MQL query as a Javascript object."
        },
        {
          "name" : "envelope",
          "type" : "obj",
          "optional" : true,
          "description" : "Envelope parameters used by the query, (e.g., as_of_time, page).",
          "structure" : [
            {
              "name" : "as_of_time",
              "type" : "string",
              "optional" : true,
              "description" : "Specify that the results should reflect the state of the database as of the time specified by the timestamp (useful for making historical queries). An ISO8601 date/time string."
            },
            {
              "name" : "page",
              "type" : "number",
              "optional" : true,
              "description" : "A page number, starting from 1."
            },
            {
              "name" : "cursor",
              "type" : "bool",
              "optional" : true,
              "description" : "Enables the retrieval of a large result set in batches.  Present the cursor you receive in the response envelope in the next request envelope to get the next set of results.",
              "default" : false
            },
            {
              "name" : "escape",
              "type" : "bool",
              "optional" : true,
              "description" : "Enables escaping of , & characters. Should not be used to display output in web browsers since it opens vulnerability to script injection attacks.",
              "default" : true
            },
            {
              "name" : "lang",
              "type" : "string",
              "optional" : true,
              "description" : "specify the language in which you want the results returned",
              "default" : "/lang/en"
            },
            {
              "name" : "uniqueness_failure",
              "type" : "string",
              "choices" : {
                "hard" : "Error when there's a uniqueness failure.",
                "soft" : "Don't error when there's a uniqueness failure."
              },
              "optional" : true,
              "description" : "Prevents an error when more than one result is returned and the query is not enclosed in square brackets indicating that multiple results are expected.",
              "default" : "hard"
            }
          ]
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for this web service",
          "structure" : [].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ],
      description: "Performs a MQL read. The result is a Javascript object that contains a property called \"result\" if the query was successful."
    },
    "mqlwrite": {
      type: "function",
      paramInfo: [
        {
          "name" : "mql_query",
          "type" : "obj",
          "optional" : false,
          "description" : "The MQL query as a Javascript object."
        },
        {
          "name" : "envelope",
          "type" : "obj",
          "optional" : true,
          "description" : "Envelope parameters used by the query."
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for this web service",
          "structure" : [].concat(acre.require("./obj_freebase_options").exports.structure)
        }   
      ],
      description: "Performs a MQL write."
    },
    "extend_query": {
      type: "function",
      paramInfo: [
        {
          "name" : "mql_obj",
          "type" : "obj",
          "optional" : false,
          "description" : "A MQL query as a Javascript object"
        },
        {
          "name" : "overrides",
          "type" : "obj",
          "optional" : false,
          "description" : "A Javascript object whose properties are used to override properties in the MQL query.  The object's keys use the same syntax as MQL sort directives in that they support both '.' notation and automatically traverse arrays.  If segments of the path are missing, they will automatically be created.  The value will then be set at the location the path specifies, replacing any existing value."
        }
      ],
      description: "Overlay new key/value pairs in the given obj into an existing query.  NOTE: <em>extend_query</em> modifies the original query object, so if you would like to use the same base query more than once, you may want to create a deep copy first."
    },
    "get_topic" : {
      type: "function",
      paramInfo: [
        {
          "name" : "id",
          "type" : "string",
          "optional" : "false",
          "description" : ""
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for this web service",
          "structure" : [
            {
              "name" : "mode",
              "type" : "string",
              "choices" : {
                "basic" : "Only the meta-data for a topic without any properties.",
                "standard" : "Includes properties"
              },
              "optional" : true,
              "description" : "What level of data to return for the topic",
              "default" : "basic"
            },
            {
              "name" : "domains",
              "type" : "string",
              "optional" : true,
              "description" : "Comma-separated list of domain IDs.  Only properties from the listed domains will be returned"
            }
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ]
    },
    "search": {
      type: "function",
      paramInfo: [
        {
          "name" : "query",
          "type" : "string",
          "optional" : false,
          "description" : "The string pattern to search for, e.g., \"love*\"."
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "Custom key/value options for the relevance search service (<a target=\"blank\" href=\"http://www.freebase.com/api/service/search?help\">details</a>).",
          "structure" : [
            {
              "name" : "limit",
              "type" : "number",
              "description" : "Maximum number of results to return. Default is 20."
            },
            {
              "name" : "type",
              "type" : "string",
              "description" : "One or more type IDs to restrict the results to, separated by commas (e.g., \"/people/person,/business/company\")."
            },
            {
              "name" : "type_strict",
              "type" : "string",
              "description" : "Specifies how the given type or types should be taken into account.",
              "choices" : {
                "should" : "Types are not required to match, but results with matched types are boosted.",
                "any" : "Each result has at least one matched type.",
                "all" : "Each result must match all types specified."
              }
            },
            {
              "name" : "domain",
              "type" : "string",
              "description" : "One or more domain IDs to restrict the results to, separated by commas (e.g., \"/people,/business\")."
            },
            {
              "name" : "domain_strict",
              "type" : "string",
              "description" : "Specifies how the given domain or domains should be taken into account.",
              "choices" : {
                "should" : "Domains are not required to match, but results with matched domains are boosted.",
                "any" : "Each result has at least one matched domain.",
                "all" : "Each result must match all domains specified."
              }
            },
            {
              "name" : "type_exclude",
              "type" : "string",
              "description" : "One or more type IDs to exclude from results, separated by commas (e.g., \"/people/person,/business/company\")."
            },
            {
              "name" : "type_exclude_strict",
              "type" : "string",
              "description" : "Specifies how the given excluded type or types should be taken into account.",
              "choices" : {
                "should" : "Results with excluded types are demoted but not removed automatically.",
                "any" : "If a result has any type in the excluded type list, then it is excluded.",
                "all" : "If a result has all the types in the excluded type list, then it is excluded."
              }
            },
            {
              "name" : "domain_exclude",
              "type" : "string",
              "description" : "One or more domain IDs to exclude from results, separated by commas (e.g., \"/people,/business\")."
            },
            {
              "name" : "domain_exclude_strict",
              "type" : "string",
              "description" : "Specifies how the given excluded domain or domains should be taken into account.",
              "choices" : {
                "should" : "Results with excluded domains are demoted but not removed automatically.",
                "any" : "If a result has any domain in the excluded domain list, then it is excluded.",
                "all" : "If a result has all the domains in the excluded domain list, then it is excluded."
              }
            },
            {
              "name" : "blacklist",
              "type" : "string",
              "description" : "A comma-separated list of blacklist names. Only one blacklist, named \"fus\", is available at the moment, and it includes /type/domain, /type/type, /common/topic, /type/user, /freebase/freebase_help_topic, and /music/track."
            }
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ],
      description: "Performs a text search."
    },
    "get_blob": {
      description: "Retrieves content from the content store given a document's ID.",
      type: "function",
      paramInfo: [
        {
          "name" : "id",
          "type" : "string",
          "optional" : false,
          "description" : "The ID of the Blob to obtain."
        },
        {
          "name" : "mode",
          "type" : "string",
          "optional" : true,
          "description" : "The retrieval mode.",
          "choices" : {
            "blurb" : "The <em>blurb</em> mode returns plain text and works only with content whose original content-type is of the form text/*. If the original content is an html document, only the contents of the &lt;p&gt; tags are processed... contents of all other tags are discarded.",
            "raw" : "Despite the name, <em>raw</em> requests are still processed in an attempt to guard against the most blatant forms of malicious use.",
            "unsafe" : "For truly 'raw' content, wear rubber gloves with <em>unsafe</em>. "
          }
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "Optional arguments passed to some retrieval modes.",
          "structure" : [
            {
              "name" : "maxlength",
              "type" : "number",
              "description" : "The max length of the blurb to retrieve (used only in 'blurb' mode)."
            },
            { 
              "name" : "break_paragraphs",
              "type" : "boolean",
              "description" : "Wheather the blurb mode should break on paragraphs or not (defaults to 'true')."
            }
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ]
    },
    "upload": {
      type: "function",
      description: "Uploads content to the content store.",
      paramInfo: [
        {
          "name" : "content",
          "type" : "string",
          "optional" : false,
          "description" : "The content to upload."
        },
        {
          "name" : "content_type",
          "type" : "string",
          "optional" : false,
          "description" : "The MIME type of the content."
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : false,
          "description" : "Custom key/value options for the upload service",
          "structure" : [
            {
              "name" : "document",
              "type" : "string",
              "description" : "ID of an existing document to which the uploaded content object should be linked to."
            },
            {
              "name" : "content",
              "type" : "string",
              "description" : "ID of the current /type/content attached to the document.  Upload will fail if this doesn't match.  Useful for avoiding clobbering changes."
            }            
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ]
    },
    "get_user_info": {
      type: "function",
      paramInfo: [
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for this web service",
          "structure" : [
            {
              "name" : "mql_output",
              "type" : "obj",
              "description" : "Query to use for retrieving data about the user",
              "optional" : true
            }
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }   
      ],
      description: "Returns a JSON object of user info if the use ris logged in via OAuth."
    },
    "create_group" : {
      "type" : "function",
      paramInfo: [
        {
          "name" : "name",
          "type" : "string",
          "optional" : false,
          "description" : "The name to give the newly created permission group",
        },
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for this web service",
          "structure" : [
            {
              "name" : "extra_group",
              "type" : "string",
              "description" : "The ID of an existing user group to include in the new permission object",
              "optional" : true
            }
          ].concat(acre.require("./obj_freebase_options").exports.structure)
        }
      ],
      description: "Creates a new permission group that can then be used to create future permissioned nodes (with use_permission_of)."
    },
    "touch": {
      type: "function",
      paramInfo: [
        {
          "name" : "options",
          "type" : "obj",
          "optional" : true,
          "description" : "General HTTP options and additional key/value params for the mqlread web service",
          "structure" : [].concat(acre.require("./obj_freebase_options").exports.structure)
        }   
      ],
      description: "Updates the request's (and the user's) MWLastWriteTime cookie which is necessary for getting the latest content from other Freebase APIs."
    },
    
    "imgurl": {
      type: "function",
      description: "Returns a URL that can be used as the src attribute of an img tag.  More <a href='/docs/web_services/image_thumb'>detail</a> can be found in the documentation of the image_thumb web service.",
      paramInfo: [
        {
          "name" : "id",
          "type" : "string",
          "optional" : false,
          "description" : "The ID of the image."
        },
        {
          "name" : "maxwidth",
          "type" : "number",
          "optional" : false,
          "description" : "Maximum width of the image, in pixels."
        },
        {
          "name" : "maxheight",
          "type" : "number",
          "optional" : false,
          "description" : "Maximum height of the image, in pixels."
        },
        {
          "name" : "mode",
          "type" : "string",
          "optional" : false,
          "description" : "How to fit the image into the specified maximum dimensions by scaling and cropping.",
          "choices" : {
            fit : "In fit mode, given a rectangle, the image will be resized to fit in the rectangle. There may be empty space left over along one dimension.",
            fill : "In fill mode, given a rectangle, the image will be resized so that the rectangle fits completely inside the resulting image and one of the image dimensions is the same as one of the provided rectangle's. ",
            fillcrop : "In this mode, a fill operation is done and any part of the image that protrudes out of the provided rectangle is cropped out.  Requires that both the dimensions of the desired rectangle are provided.",
            fillcropmid : "In this mode, a fill operation is done, the crop rectangle is centered on the resulting image and any part of that image that protrudes out of the centered rectangle is cropped out. Center is calculated by: (image.x - crop.x)/2, and y is 0."
          }
        },
        {
          "name" : "pad",
          "type" : "number",
          "optional" : true,
          "description" : "The intention of pad is to allow the user to predict dimensions of the resulting image even if the resulting dimensions do not match the requested maxwidth and maxheight."
        },
        {
          "name" : "errorid",
          "type" : "string",
          "optional" : true,
          "description" : "Freebase ID of a topic or image that is the fallback in case the original cannot be thumbnailed."
        }
      ]
    },
    "date_from_iso": {
      type: "function",
      paramInfo: [
        {
          "name" : "iso_date",
          "type" : "string",
          "optional" : false,
          "description" : "The ISO8601 date/time string to parse (e.g., \"2009-11-29\")."
        }
      ],
      description: "Converts an ISO8601 date string returned in MQL to Javascript Date object."
    },
    "date_to_iso": {
      type: "function",
      paramInfo: [
        {
          "name" : "date",
          "type" : "Date",
          "optional" : false,
          "description" : "The Javascript Date object to encode as an ISO8601 string."
        }
      ],
      description: "Converts a Javascript Date object to an ISO8601 date string usable in MQL."
    },
    "mqlkey_quote" : {
      type: "function",
      paramInfo: [
        {
          "name" : "string",
          "type" : "String",
          "optional" : false,
          "description" : "a Javascript string"
        }
      ],
      description: "Encode a Javascript string to turn it into a valid MQL /type/key/value"
    },
    "mqlkey_unquote" : {
      type: "function",
      paramInfo: [
        {
          "name" : "string",
          "type" : "String",
          "optional" : false,
          "description" : "a MQL /type/key/value string"
        }
      ],
      description: "Unencode a MQL /type/key/value string to a Javascript string"
    }
  }
};
