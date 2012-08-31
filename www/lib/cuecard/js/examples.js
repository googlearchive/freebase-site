/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
    {   name: "Vietnamese restaurants in Palo Alto, California",
        query: [{
          "mid": null,
          "name": null,
          "type": "/dining/restaurant",
          "cuisine": "Vietnamese",
          "/business/business_location/address": [{
            "state_province_region": "California",
            "citytown": "Palo Alto"
          }]
        }],
        techniques: [ "basic", "geographic location" ]
    },
    {   name: "Properties of /music/artist",
        query: [{
            "type" : "/type/property",
            "schema" : {
              "id" : "/music/artist"
            },
            "id" : null,
            "name" : null
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
            "mid" : null,
            "sort" : "name",
            "type" : "/meteorology/cloud_classification"
        }],
        techniques: [ "basic", "sorting" ]
    },
    {   name: "U.S. states containing cities whose names start with 'Blue' or 'Red'",
        query: [{
            "a:contains" : [{
                "name" : null,
                "mid" : null,
                "name~=" : "^Red",
                "type" : "/location/citytown"
            }],
            "b:contains" : [{
                "name" : null,
                "mid" : null,
                "name~=" : "^Blue",
                "type" : "/location/citytown"
            }],
            "b:type" : "/location/us_state",
            "name" : null,
            "mid" : null,
            "type" : "/location/location"
        }],
        techniques: [ "text search", "multiple constraints on same property" ]
    },
    {   name: "2 of The Police's albums and their tracks",
        query: [{
          "type": "/music/album",
          "mid": null,
          "limit": 2,
          "name": null,
          "releases": {
            "track": [],
            "limit": 1
          },
          "artist": {
            "name": "The Police",
            "type": "/music/artist"
          }
        }],
        techniques: [ "basic", "limiting number of results" ]
    },
    {   name: "25 Songs with the word 'love' in their titles, with release date, album and artist",
        query: [{
          "releases": {
            "album": {
              "artist": [],
              "name": null,
              "limit": 1
            },
            "release_date": null,
            "limit": 1
          },
          "limit": 25,
          "name": null,
          "name~=": "Love*",
          "type": "/music/track"
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
            "mid" : null,
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
                "mid" : null,
                "limit" : 2
            }],
            "limit" : 35,
            "name" : null,
            "mid" : null,
            "type" : "/film/actor"
        }],
        techniques: [ "multiple constraints on same property", "date query", "limiting number of results", "range constraint" ]
    },
    {   name: "Directors who have directed both Parker Posey and any actor named Robert (in possibly different films)",
        query: [{
          "parker_film:film": [{
            "name": null,
            "mid": null,
            "starring": [{
              "actor": "Parker Posey"
            }]
          }],
          "robert_film:film": [{
            "name": null,
            "mid": null,
            "starring": [{
              "actor": null,
              "actor~=": "Robert*"
            }]
          }],
          "name": null,
          "mid": null,
          "type": "/film/director"
        }],
        techniques: [ "multiple constraints on same property", "text search", "compound value type (CVT)" ]
    },
    {   name: "Music artists with albums containing a track called 'One Tree Hill'",
        query: [{
          "album": [{
            "name": null,
            "mid": null,
            "releases": [{
              "track": [{
                "name": "One Tree Hill"
              }]
            }]
          }],
          "name": null,
          "id": null,
          "type": "/music/artist"
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
          "type": "/film/film",
          "only:starring": {
            "actor": {
              "name": "Kevin Bacon"
            }
          },
          "name": null,
          "imdb_id": [],
          "music": [],
          "produced_by": [],
          "starring": [{
            "actor": []
          }]
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
          "type": "/music/track",
          "length": null,
          "length>": 300,
          "name": null,
          "releases": [{
            "album": {
              "artist": "The Police",
              "name": "Synchronicity"
            }
          }]
        }],
        techniques: [ "range constraint" ]
    },
    {   name: "Properties of a particular type (/government/politician)",
        query: [{
          "type": "/type/property",
          "schema": {
            "id": "/government/politician"
          },
          "id": null,
          "name": null
        }],
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
        query: [{
          "type": "/type/type",
          "domain": {
            "id": "/music"
          },
          "name": null
        }],
        techniques: [ "schema inspection" ]
    },
    {   name: "Creating a new topic given a name and a type",
        query: {
          "create" : "unless_exists",
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "mid" : null
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
          "mid" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "mid" : null,
            "connect" : "insert"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Deleting a link between two topics",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "mid" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "mid" : null,
            "connect" : "delete"
          }
        },
        techniques: [ "adding data" ]
    }
];

CueCard.ExampleTechniqueMap = {
    "all" : []
};

for (var i=0; i < CueCard.Examples.length; i++) {
    var example = CueCard.Examples[i];
    CueCard.ExampleTechniqueMap["all"].push(i);
    for (var x = 0; x < example.techniques.length; x++) {
        var technique = example.techniques[x];
        if (technique in CueCard.ExampleTechniqueMap) {
            CueCard.ExampleTechniqueMap[technique].push(i);
        } else {
            CueCard.ExampleTechniqueMap[technique] = [ i ];
        }
    }
}
