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
 */

acre.require('/test/lib').enable(this);
var tasks = acre.require("routes");

test("test _getParams", function(){
       var params = tasks._get_params("/12345");
       equals(params.length, 1, "param length should be 1.");
       equals(params[0][0], "task");
       equals(params[0][1], "/12345");

       params = tasks._get_params("/12346/-/projects/7890");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "/12346");
       equals(params[1][0], "projects");
       equals(params[1][1], "/7890");

       params = tasks._get_params("/12346/-/projects/");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "/12346");
       equals(params[1][0], "projects");
       equals(params[1][1], null);

       params = tasks._get_params("/12346/-/projects");
       equals(params.length, 2, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "/12346");
       equals(params[1][0], "projects");
       equals(params[1][1], null);
       
       params = tasks._get_params("/12346/-/project/m/123/-/domain/en/film");
       equals(params.length, 3, "param length should be 2.");
       equals(params[0][0], "task");
       equals(params[0][1], "/12346");
       equals(params[1][0], "project");
       equals(params[1][1], "/m/123");
       equals(params[2][0], "domain");
       equals(params[2][1], "/en/film");

});

acre.test.report();
