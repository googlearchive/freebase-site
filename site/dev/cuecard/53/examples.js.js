CueCard.ExampleTechniques = [
    "all",
    "basic",
    "sorting",
    "text search",
    "range constraint",
    "date query",
    "multiple constraints on same property",
    "limiting number of results",
    "geographic location",
    "compound value type (CVT)",
    "schema inspection",
    "attribution",
    "adding data"
];

CueCard.Examples = [
    {   name: "Vietnamese restaurants in Aspen, Colorado",
        query: [{
            "/business/business_location/address" : {
              "citytown" : "Aspen",
              "state_province_region" : "Colorado"
            },
            "cuisine" : "Vietnamese",
            "name" : null,
            "id" : null,
            "type" : "/dining/restaurant"
        }],
        techniques: [ "basic", "geographic location" ]
    },
    {   name: "Properties of /music/artist",
        query: [{
            "id" : "/music/artist",
            "properties" : [{}],
            "type" : "/type/type"
        }],
        techniques: [ "schema inspection" ]
    },
    {   name: "All types created by the user jamie",
        query: [{
            "creator" : "/user/jamie",
            "name" : null,
            "id" : null,
            "type" : "/type/type"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Cloud classifications sorted by name",
        query: [{
            "clouds" : [],
            "name" : null,
            "id" : null,
            "sort" : "name",
            "type" : "/meteorology/cloud_classification"
        }],
        techniques: [ "basic", "sorting" ]
    },
    {   name: "U.S. states containing cities whose names start with 'Blue' or 'Red'",
        query: [{
            "a:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Red",
                "type" : "/location/citytown"
            }],
            "b:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Blue",
                "type" : "/location/citytown"
            }],
            "b:type" : "/location/us_state",
            "name" : null,
            "id" : null,
            "type" : "/location/location"
        }],
        techniques: [ "text search", "multiple constraints on same property" ]
    },
    {   name: "2 of The Police's albums and their tracks",
        query: {
          "album" : [{
              "id" : null,
              "limit" : 2,
              "name" : null,
              "track" : []
          }],
          "id" : null,
          "name" : "The Police",
          "type" : "/music/artist"
        },
        techniques: [ "basic", "limiting number of results" ]
    },
    {   name: "25 Songs with the word 'love' in their titles, with release date, album and artist",
        query: [{
            "album" : {
              "artist" : [],
              "name" : null,
              "id" : null,
              "release_date" : null
            },
            "limit" : 25,
            "name" : null,
            "name~=" : "Love*",
            "type" : "/music/track"
        }],
        techniques: [ "text search", "limiting number of results", "date query" ]
    },
    {   name: "Films starring both Joe Pesci and Robert de Niro, showing their full cast",
        query: [{
            "a:starring" : [{
                "actor" : "Joe Pesci"
            }],
            "b:starring" : [{
                "actor" : "Robert de Niro"
            }],
            "name" : null,
            "id" : null,
            "starring" : [{
                "actor" : null
            }],
            "type" : "/film/film"
        }],
        techniques: [ "multiple constraints on same property", "compound value type (CVT)" ]
    },
    {   name: "32 actors born in the 1960s, with two films of each actor",
        query: [{
            "/people/person/date_of_birth" : null,
            "/people/person/date_of_birth<" : "1970",
            "/people/person/date_of_birth>=" : "1960",
            "film" : [{
                "film" : null,
                "id" : null,
                "limit" : 2
            }],
            "limit" : 35,
            "name" : null,
            "id" : null,
            "type" : "/film/actor"
        }],
        techniques: [ "multiple constraints on same property", "date query", "limiting number of results", "range constraint" ]
    },
    {   name: "Directors who have directed both Parker Posey and any actor named Robert (in possibly different films)",
        query: [{
            "a:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : "Parker Posey"
                }
            }],
            "b:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : null,
                  "actor~=" : "Robert*"
                }
            }],
            "name" : null,
            "id" : null,
            "type" : "/film/director"
        }],
        techniques: [ "multiple constraints on same property", "text search", "compound value type (CVT)" ]
    },
    {   name: "Music artists with albums containing a track called 'One Tree Hill'",
        query: [{
            "album" : [{
                "name" : null,
                "id" : null,
                "track" : [{
                    "length" : null,
                    "name" : "One Tree Hill"
                }]
            }],
            "name" : null,
            "id" : null,
            "type" : "/music/artist"
        }],
        techniques: [ "compound value type (CVT)", "basic" ]
    },
    {   name: "Everything about 'Jimi Hendrix'",
        query: {
          "*" : null,
          "name" : "Jimi Hendrix",
          "type" : "/music/artist"
        },
        techniques: [ "basic" ]
    },
    {   name: "Kevin Bacon's films, with cast, producers, music, etc.",
        query: [{
            "film" : [{
                "film" : {
                  "imdb_id" : [],
                  "music" : [],
                  "name" : null,
                  "id" : null,
                  "produced_by" : [],
                  "starring" : [{
                      "actor" : [{}]
                  }],
                  "type" : []
                }
            }],
            "name" : "Kevin Bacon",
            "type" : "/film/actor"
        }],
        techniques: [ "basic", "compound value type (CVT)" ]
    },
    {   name: "When 'Star Wars Episode IV' was added to the database, and by whom",
        query: [{
            "creator" : null,
            "id" : "/wikipedia/en/Star_Wars_Episode_IV",
            "name" : null,
            "timestamp" : null,
            "type" : "/film/film"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Tracks on Synchronicity longer than 300 seconds",
        query: [{
            "artist" : "The Police",
            "name" : "Synchronicity",
            "track" : [{
                "length" : null,
                "length>" : 300,
                "name" : null
            }],
            "type" : "/music/album"
        }],
        techniques: [ "range constraint" ]
    },
    {   name: "Properties of a particular type (/government/politician)",
        query: {
          "id" : "/government/politician",
          "properties" : [],
          "type" : "/type/type"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Properties of a particular property (/type/object/name)",
        query: {
          "*" : null,
          "id" : "/type/object/name",
          "type" : "/type/property"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Types in a particular domain (/music)",
        query: {
          "id" : "/music",
          "type" : "/type/domain",
          "types" : []
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Creating a new topic given a name and a type",
        query: {
          "create" : "unless_exists",
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "guid" : null
        },
        techniques: [ "adding data" ]
    },
    {   name: "Setting a basic unique property to a topic",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "basic_property" : {
            "value" : 42,
            "connect" : "update"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Connecting one topic to another",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "insert"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Deleting a link between two topics",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "delete"
          }
        },
        techniques: [ "adding data" ]
    }
];