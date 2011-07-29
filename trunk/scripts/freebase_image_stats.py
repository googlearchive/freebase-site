#!/usr/bin/python

import freebase, sys
from urlparse import urlparse
from pprint import pprint


image_query = [{
        "type": "/common/image",
        "/common/licensed_object/license": [{
            "id":       None,
            "optional": True
            }],
        "!/type/content_import/content": {
            "/type/content_import/uri": None,
            "optional": True,
            "limit" : 1
            },
        }]


result = freebase.mqlreaditer(image_query)

image_data = { }

c = 0
licenses = set()
for image in result:
  c += 1

  if not c % 10000:
      v = "%s (%s domains)" % (c, str(len(image_data.keys())))
      print >> sys.stderr, v

  # Figure out the import domain.
  import_domain = "unknown"
  if image.get("!/type/content_import/content") and image["!/type/content_import/content"]["/type/content_import/uri"]:
    o = urlparse(image["!/type/content_import/content"]["/type/content_import/uri"])
    if o.netloc:
      import_domain = o.netloc

  # Figure out the license.
  img_licenses = ["no_license"]
  if image.get("/common/licensed_object/license"):
    img_licenses = [x["id"] for x in image["/common/licensed_object/license"]]
    
  if not image_data.get(import_domain):
      image_data[import_domain] = { "t" : 0, "m" : 0}

  image_data[import_domain]["t"] += 1

  for l in img_licenses:

    if l.startswith("/en/"):
        l = l[4:]

    licenses.add(l)
    if not image_data[import_domain].get(l):
      image_data[import_domain][l] = 0

    image_data[import_domain][l] += 1  


  if len(img_licenses) > 1:
    image_data[import_domain]["m"] += 1

  if not c % 10000:
      v = "%s (%s domains)" % (c, str(len(image_data.keys())))
      print >> sys.stderr, v



sorted_domains = sorted(image_data.keys(), cmp=lambda a,b: image_data[a]["t"] - image_data[b]["t"])
sorted_domains.reverse()

print "domain,%s,multiple,total" % ",".join(licenses)

licenses = list(licenses)

for domain in image_data.keys():
  values = []
  values.append(domain)
  for l in licenses:
    values.append(str(image_data[domain].get(l, "")))
  
  values.extend([str(image_data[domain]["m"]), str(image_data[domain]["t"])])

  print ",".join(values)
                  


        
