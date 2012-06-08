#!/usr/bin/env python
"""Simple wrapper for the speedtest used by buildbot

Usage: perftest.py <site_host_label> <site_scripts_path>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

__author__ = 'bneutra@google.com (Brendan Neutra)'

import json
import os
import re
import sys
import time

LICENSE_PREAMBLE = '''
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
 *
 * Additional Licenses for Third Party components can be found here:
 * http://wiki.freebase.com/wiki/Freebase_Site_License
 *
 */

'''

APPENGINE_PATH='/opt/appengine-latest'
DEFAULT = ['domain', 'type', 'user', 'type_inspect', 'topic_inspect', 'domain_inspect', 'topic_web']
BASIC = ['explore', 'schema', 'apps', 'homepage']
COMPLEX = ['topic']
SCENARIO = {
  'DEFAULT': 50,
  'COMPLEX': 100,
  'BASIC': 20
}
# increment this to v1 etc, as we change the test scenario
SCENARIO_VERSION=''

def runtest(host, site_path):
  """run sitedeploy speedtest repeatedly output mwtestdb results."""

  os.chdir(site_path)
  curr_ver = os.popen('readlink %s' % APPENGINE_PATH).read().rstrip()
  json_result = {
  "errors": 0,
  "failed": 0,
  "skipped": 0,
  "passed": 0,
  "buildinfo": curr_ver,
  "elapsed": 0.0,
  "host": host,
  "testresults" :{}
  }
  
  start = time.time()
  def do_test(host, ptype, n):
    """invoke one speedtest grab the csv file path."""

    print "speedtest:", ptype
    testid = 'speedtest/%s:perf%s' % (ptype, SCENARIO_VERSION)
    fl=os.popen('./sitedeploy.py speedtest --host %s --page %s --repeat %s --cost all' % (host, ptype, n))
    output = fl.read()
    print output
    m=re.search('CSV dump: (/.+/.+$)', output)
    if m:
      csvfile = m.groups()[0]
      return testid, True, open(csvfile).read()
    else:
      return testid, False, ''
  
  for ptype in COMPLEX + DEFAULT + BASIC:
    if ptype in COMPLEX:
      n = SCENARIO['COMPLEX']
    elif ptype in BASIC:
      n = SCENARIO['BASIC']
    else:
      n = SCENARIO['DEFAULT']
    testid, success, csvdata=do_test(host, ptype, n)
    if success is False:
      json_result['errors']+=1
      json_result['testresults'][testid] = ['ERROR', "error running test"]
    else:
      res = 'PASS'
      # look for 200's in the non-header lines
      # just to include basic success stats in the result
      csvrows = csvdata.rstrip().split('\n')[1:]
      for ln in csvrows:
        if not ln.startswith('200'): res = 'FAIL'
      if res == 'FAIL':
        json_result['failed']+=1
      else:
        json_result['passed']+=1
      json_result['testresults'][testid] = [res, csvdata]
  
  json_result['elapsed'] = time.time() - start
  
  print 'json=%s' % json.dumps(json_result)

if __name__ == '__main__':
  if len(sys.argv)<3:
    sys.stderr.write('usage: %s <site_host_label> <site_scripts_path>\n' % sys.argv[0])
    sys.exit(1)
  runtest(sys.argv[1], sys.argv[2])
