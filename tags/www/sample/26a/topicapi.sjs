var result = acre.urlfetch("http://www.sandbox-freebase.com/api/experimental/topic/full" + acre.request.params["id"] + "?lang=/lang/en", { "headers" : { "Cache-control" : "no-cache" }});

acre.write("ok");
