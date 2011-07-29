// This should give a 301, but instead returns an ACRE INTERNAL ERROR
// Request chain time quota expired at com.google.acre.script.HostEnv.bootScript(HostEnv.java:421)

var result = acre.urlfetch("http://freebase.com");
acre.write(JSON.stringify(result));
acre.exit();