var util = acre.require("util");

var contents = {
  "contents": [
    {
      "name": "Overview",
      "key": "common",
      "content": acre.freebase.service_url + "/api/service/mqlread?help=extended"
    }
  ],
  "status": "200 OK"
};

var fetch = util.acre_get(acre.freebase.service_url + "/api/service/mqlread?help=gallery&format=json&indent=1");
var list = JSON.parse(fetch.body);

for each (var item in list) {
  item.content = acre.freebase.service_url + item.content;
}

contents.contents = contents.contents.concat(list);

if (acre.current_script == acre.request.script) {
  acre.write(JSON.stringify(contents, null, 2));
}
