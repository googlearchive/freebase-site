var deferred = acre.require("/freebase/site/promise/deferred");
var freebase = acre.require("/freebase/site/promise/apis").freebase;
var urlfetch = acre.require("/freebase/site/promise/apis").urlfetch;

//---Simple---
acre.write("---Simple---\n");
urlfetch("http://www.metaweb.com").then(function(response) {
  acre.write(response.status);
});

acre.async.wait_on_results();

//---Error---
acre.write("\n\n---Error---\n");
urlfetch("http://www.metaweb.com/success")
  .then(function(response) {
    acre.write("We made it big!");
    return response;
    
  }, function(error) {
    if (error.info.status === 404) {
      acre.write("Success not found :(");
    } else if (error.info.status === 500) {
      acre.write("Reply hazy. Try again soon.");
    } else {
       return error;
    }
  });

acre.async.wait_on_results();

//---Chaining---
acre.write("\n\n---Chaining---\n");
freebase.mqlread({id: "/en/metaweb", name: null})
  .then(function(envelope) {
    return envelope.result;
  })
  .then(function(result) {
    return result.name;
  })
  .then(function(name) {
    acre.write(name);
  });

acre.async.wait_on_results();

//---Waiting on multiple promises---
acre.write("\n\n---Waiting on multiple promises---\n");
var psteam = freebase.mqlread({id: "/en/steam", name: null});
var ppunk = freebase.mqlread({id: "/en/punk", name: null});
deferred.all([psteam, ppunk])
  .then(function([steam, punk]) {
    //acre.write(steam.result.name);
    acre.write(punk.result.name);
  });

acre.async.wait_on_results();

//---Chaining Tree---
acre.write("\n\n---Chaining Tree---\n");
var query = {
  "id": "/en/lady_gaga",
  "name": null,
  "type": "/people/person",
  "place_of_birth": {"id": null, "limit": 1}
};
var pgaga = freebase.mqlread(query)
  .then(function(envelope) {
    return envelope.result;
  })

pgaga
  .then(function(result) {
    return result.name
  })
  .then(function(name) {
    acre.write(" - " + name + " - ");
  });

pgaga
  .then(function(result) {
    return freebase.mqlread({"id": result.place_of_birth.id, name: null});
  })
  .then(function(envelope) {
    return envelope.result.name;
  })
  .then(acre.write);

acre.async.wait_on_results();