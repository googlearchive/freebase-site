#!/usr/bin/python
import freebase, pdb
from urlparse import urlparse
from pprint import pprint

query = [{
        "type": "/common/document",
        "/common/document/source_uri": {
            "value":       None,
            "optional": True
            },
        "limit" : 1000
        }]


result = freebase.mqlreaditer(query)

data = { }

c = 0

for blurb in result:
  c += 1

  # Figure out the import domain.
  import_domain = "unknown"
  if blurb.get("/common/document/source_uri") and blurb["/common/document/source_uri"]["value"].startswith("http://wp/"):
      import_domain = "wikipedia"

  if not data.get(import_domain):
      data[import_domain] = 0

  data[import_domain] += 1

  if not c % 1000:
      print c

for domain, value in data.iteritems():
    print "%s: %s" % (domain, value)
