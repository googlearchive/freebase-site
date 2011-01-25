/*
 * Copyright 2010, Google Inc.
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

CueCard.MqlSyntax = {};

CueCard.MqlSyntax.KeywordSuggestions = [
    {   label: "*",
        hint: "(keyword)",
        qualifiedProperty: "*",
        result: "*"
    },
    {   label: "connect",
        hint: "(keyword)",
        qualifiedProperty: "connect",
        result: "connect"
    },
    {   label: "create",
        hint: "(keyword)",
        qualifiedProperty: "create",
        result: "create"
    },
    {   label: "estimate-count",
        hint: "(keyword)",
        qualifiedProperty: "estimate-count",
        result: "estimate-count"
    },
    {   label: "limit",
        hint: "(keyword)",
        qualifiedProperty: "limit",
        result: "limit"
    },
    {   label: "optional",
        hint: "(keyword)",
        qualifiedProperty: "optional",
        result: "optional"
    },
    {   label: "return",
        hint: "(keyword)",
        qualifiedProperty: "return",
        result: "return"
    },
    {   label: "sort",
        hint: "(keyword)",
        qualifiedProperty: "sort",
        result: "sort"
    }
];

CueCard.MqlSyntax.KeywordValueHints = {
    "*" : {
        choices: [
            {   label: "null",
                hint: "return a single value",
                result: null
            },
            {   label: "[]",
                hint: "return a list of values",
                result: [],
                offset: 1
            },
            {   label: "{}",
                hint: "return a single object",
                result: {},
                offset: 1
            },
            {   label: "[{}]",
                hint: "return a list of objects",
                result: [{}],
                offset: 2
            }
        ]
    },
    "connect" : {
        choices: [
            {   label:  "insert",
                hint:   "attach a value or object to a non-unique property, or attach the first value or object to a unique property",
                result: "insert"
            },
            {   label:  "update",
                hint:   "attach a value or object to a unique property replacing any value or object that was previously connected",
                result: "update"
            },
            {   label:  "replace",
                hint:   "update unique properties and performs an insert for non-unique properties",
                result: "replace"
            },
            {   label:  "delete",
                hint:   "detach a value or object from any property",
                result: "delete"
            }
        ]
    },
    "create" : {
        choices: [
            {   label: "unless_exists",
                hint: "look for a matching object and create it if it doesn't exist",
                result: "unless_exists"
            },
            {   label:  "unless_connected",
                hint:   "look for a matching object connected to the parent query, and create and connect it if it doesn't exist",
                result: "unless_connected"
            },
            {   label:  "unconditional",
                hint:   "create the specified object without looking for a match (dangerous; ues carefully)",
                result: "unconditional"
            }
        ]
    },
    "estimate-count" : {
        choices: [
            {   label: "null",
                hint: "(keyword)",
                result: null
            }
        ]
    },
    "limit" : {
        html: 'Use a positive integer to limit how many results to return, or <span class="cuecard-code">0</span> for all available results.'
    },
    "optional" : {
        choices: [
            {   label: "true",
                hint: "(keyword)",
                result: true
            },
            {   label: "false",
                hint: "(keyword)",
                result: false
            },
            {   label: "required",
                hint: "(keyword)",
                result: "required"
            },
            {   label: "forbidden",
                hint: "(keyword)",
                result: "forbidden"
            }
        ]
    },
    "return" : {
        choices: [
            {   label: "count",
                hint: "(keyword)",
                result: "count"
            },
            {   label: "estimate-count",
                hint: "(keyword)",
                result: "estimate-count"
            }
        ]
    },
    "sort" : {
        html: 'Use a property name in the same query node. Prefix it with <span class="cuecard-code">-</span> to sort in descending order. For more complex ordering, see <a href="">this documentation</a>.'
    }
};

CueCard.MqlSyntax.UniqueTopicValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single topic ID",
        result: null
    },
    {   label: "{}",
        hint: "returns a single topic object with a default set of properties",
        result: {},
        offset: 1
    },
    {   label: "{ \"id\" : null, \"name\" : null }",
        hint: "returns a single topic object with id and name",
        result: { "id" : null, "name" : null }
    }
];

CueCard.MqlSyntax.TopicValueSuggestions = [
    {   label: "[]",
        hint: "returns a list of topic IDs or topic names",
        result: [],
        offset: 1
    },
    {   label: "[{}]",
        hint: "returns a list of topic objects with a default set of properties",
        result: [{}],
        offset: 2
    },
    {   label: "[{ \"id\" : null, \"name\" : null, \"optional\" : true, \"limit\" : 10 }]",
        hint: "returns an optional, limited list of topic objects with id and name",
        result: [{ "id" : null, "name" : null, "optional" : true, "limit" : 10 }]
    }
];

CueCard.MqlSyntax.SingleValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label: "{ \"value\" : null, \"type\" : null }",
        hint: "returns a value with type",
        result: { "value" : null, "type" : null }
    }
];

CueCard.MqlSyntax.UniqueStringLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single string",
        result: null
    },
    {   label:  "{ \"value\" : null, \"lang\" : null, \"optional\" : true }",
        hint:   "returns a single string with more options",
        result: { "value" : null, "lang" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.StringLiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of strings",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"lang\" : null, \"optional\" : true }]",
        hint:   "returns a list of strings with more options",
        result: [{ "value" : null, "lang" : null, "optional" : true }]
    }
];

CueCard.MqlSyntax.UniqueLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label:  "{ \"value\" : null, \"optional\" : true }",
        hint:   "returns a single value with more options",
        result: { "value" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.LiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of values",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"optional\" : true }]",
        hint:   "returns a list of values with more options",
        result: [{ "value" : null, "optional" : true }]
    }
];