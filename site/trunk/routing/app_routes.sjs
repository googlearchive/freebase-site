/**
 *
 * routes map
 * 1. processed in order
 * 2. app handlers for each path MUST be define in your MANIFEST
 */
var routes = [
  {
    path: "/core",
    app: "/freebase/site/core"
  },
  {
    path: "/bar/foo",
    app: "/freebase/site/sample"
  },
  {
    path: "/foo/bar",
    app: "/freebase/site/domain"
  },
  {
    path: "/foo",
    app: "/freebase/site/sample"
  },
  {
    path: "/bar",
    app: "/freebase/site/domain"
  },
  {
    path: "/schema",
    app: "/freebase/site/schema"
  }
];
