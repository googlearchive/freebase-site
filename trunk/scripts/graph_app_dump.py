#!/usr/bin/python

"""
Dump a graph app to the filesystem. 
Usage: graph_app_dump.py -h
  e.g. graph_app_dump.py --license /user/jasondouglas/superapp1 ~/apps/superapp1

Note: this script relies on acre's appeditor services to be running under http://www.freebase.com/appeditor/services

"""

import sys, urllib2, os
from optparse import OptionParser

try:
  import json
except ImportError:
  import simplejson as json
except ImportError:
  print "ERROR: One of json or simplejson python packages must be installed for this to work."
  raise

GET_APP_URL = "http://www.freebase.com/appeditor/services/get_app"
GET_FILE_URL = "http://www.freebase.com/appeditor/services/get_file"

# TODO: use new Freebase APIs once appeditor is using them.
API_IMAGE_URL = "http://api.freebase.com/api/trans/raw"

LICENSE = """/*
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

"""

METADATA = """var METADATA = {
  "mounts": {
    "lib":  "//lib.www.trunk.svn.freebase-site.googlecode.dev"
  }
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);
"""

def do_request(url, binary=False):

    # HTTP Request

    try:
      print "Calling %s" % url
      response = urllib2.urlopen(url)
    except:
      print "Error: request failed."
      raise

    if binary:
      return response.read()

    # JSON Decode

    try:
      result = json.loads(response.read())
    except:
      print "Error: json decoding failed."
      raise

    return result

def write_file(filepath, contents, binary=False):

    try:
      if binary:
          fh = open(filepath, "wb")
          fh.write(contents)
      else:
          fh = open(filepath, "w")
          fh.write(contents.encode("utf-8"))
    except:
      print "Error: could not write to file %s" % filepath
      raise
    finally:
      fh.close()

    return True


def main():

  usage = "%prog [options] <app-id> <local-directory>\n"
  app_id_message = "\napp-id can be one of these formats: /foo/bar/blah or //blah.bar.foo.dev"
  usage += app_id_message

  parser = OptionParser(usage=usage)
  parser.add_option("", "--license", dest="license", action="store_true",
                    default=False, help="put a BSD license preamble on top of every text file")
  parser.add_option("", "--metadata", dest="metadata", action="store_true",
                    default=False, help="create a boilerplate METADATA.sjs file")

  (options, args) = parser.parse_args()

  # Must have at least 2 arguments.
  if len(args) < 2:
    print usage
    exit(-1)

  if not os.path.isdir(args[1]):
      print "Error: %s is not a directory" % args[1]
      exit(-1)

  # Construct the get_app url.

  if args[0].startswith("//") and args[0].endswith(".dev"):
    app_id = args[0]
  elif args[0].startswith("/") and not "." in args[0]:
    parts = [str(x) for x in args[0].split("/")]
    parts.reverse()
    app_id = "//%sdev" % ".".join(parts)
  else:
    print "Error: %s is not an accepted id format" % args[0]
    print app_id_message
    exit(-1)

  url = "%s?appid=%s" % (GET_APP_URL, app_id)

  # Perform the get_app request.

  result = do_request(url)

  # Loop through files and start writing them out.
  
  if not result["result"].get("files", False):
    print "No files in this app."
    exit(0)

  for filename, spec in result["result"]["files"].iteritems():

    filepath = os.path.join(args[1], spec["name"])

    # Binary

    if spec.get("acre_handler", None) == "binary":
      url = "%s%s" % (API_IMAGE_URL, spec["fileid"])
      contents = do_request(url, binary=True)
      write_file(filepath, contents, binary=True)

    # Text

    else:
      url = "%s?fileid=%s" % (GET_FILE_URL, spec["path"])
      file_result = do_request(url).get("result")

      contents = file_result["text"]
      if options.license:
          contents = LICENSE + contents

      write_file(filepath, contents)
        
      
  if options.metadata:
      write_file(os.path.join(args[1], "METADATA.sjs"), METADATA)

if __name__ == "__main__":
  main()
