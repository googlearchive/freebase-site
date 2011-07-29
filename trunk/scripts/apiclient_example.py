#!/usr/bin/python

try:
  from apiclient import discovery, model
except ImportError:
  print "The google apiclient is not installed in this host.\nPlease follow the instructions here: http://code.google.com/p/google-api-python-client/downloads/list to download the python apiclient."
  exit(-1)

import json

API_KEY="AIzaSyCVGuTtCETNwBv3pSmtS9WRL7zpDNtiSjc"

model.JsonModel.alt_param = ""
freebase = discovery.build("freebase", "v1-sandbox", developerKey=API_KEY)

query = json.dumps({"id" : "/en/bob_dylan", "name" : None})

response = freebase.mqlread(query=query).execute()

print response["result"]["name"]


