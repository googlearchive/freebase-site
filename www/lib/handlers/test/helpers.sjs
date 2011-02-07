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
var test_helpers = acre.require("test/helpers");

/**
 * Generate a valid metadata object to overwrite the default handler for a given extension.
 * This will also ensure the content hash of the filename being acre required/included with the metadata
 * will be random so that the "to_js" part of the handler will be run.
 *
 * @param extension:String (required) - e.g. "css"
 * @param handler:String (required) - e.g. "handlers/my_handler"
 * @param filename:String (required) - e.g. "some/filename" being required/included with this metadata
 */
function metadata(extension, handler, filename) {
  var md =  {
    handlers: {
      /**
      "mf.css": "handlers/css_manifest_handler"
       **/
    },
    extensions: {
      /**
      "mf.css": {
        handler: "mf.css"
      }
       **/
    },
    files: {
      /**
      "handlers/handle_me.mf.css": {
        content_hash: test_helpers.random()   // this invalidates the compiled_js cache so that "to_js" will run
      }
       **/
    }
  };

  md.handlers[extension] = handler;
  md.extensions[extension] = {handler: extension};
  md.files[filename] = {content_hash: test_helpers.random()};

  //console.log("metadata", md);

  return md;
};
