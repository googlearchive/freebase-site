/*
 * Copyright 2012, Google Inc.
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

acre.require("lib/test/mock").playback(this, "test/playback_test_processVote.json");
//acre.require("lib/test/mock").record(this, "test/playback_test_processVote.json");

var freebase = acre.require("lib/promise/apis.sjs").freebase;
var h = acre.require("lib/helper/helpers.sjs");

var voteSJS = acre.require("vote.sjs");
var processVote = acre.require("vote.sjs").processVote;
var deleteFlag = acre.require("vote.sjs").deleteFlag;

// this test requires user to be logged in
var user;
test("login required", function() {
    freebase.get_user_info().then(function(user_info) {user = user_info;});
    acre.async.wait_on_results();
    ok(user, "login required");
});
if (!user) {
    acre.test.report();
    acre.exit();
}

var natsuAsUser  = { id: "/user/natsu",};

test("processVote - Invalid Params", function() {
    var result = null;

    processVote(null, "agree", "/en/mark_halperin_and_john_f_harris", natsuAsUser).then(function(r) {result = r;}, function(r){result = r});
    acre.async.wait_on_results();  
    ok(result.message === voteSJS.missingParams, "Caught invalid param." );

    processVote("/user/natsu", null, "/en/mark_halperin_and_john_f_harris", natsuAsUser).then(function(r) {result = r;}, function(r){result = r}); 
    acre.async.wait_on_results();  
    ok(result.message === voteSJS.missingParams, "Caught invalid param." + result);

    processVote("/user/natsu", "agree", "/en/mark_halperin_and_john_f_harris", null).then(function(r) {result = r;}, function(r){result = r}); 
    acre.async.wait_on_results();  
    ok(result.message === voteSJS.missingParams, "Caught invalid param." + result);

    processVote("/m/09jy7p7", "BLKAJSDLKFJ", "/en/mark_halperin_and_john_f_harris", natsuAsUser).then(function(r) {result = r;}, function(r){result = r});
    acre.async.wait_on_results();
    ok(result.message === voteSJS.invalidVote, "Caught invalid vote: " + result);

});

test("processVote - Valid Voting", function() {

    var result = null;

    // Normal voting
    processVote("/m/09jy7p7", "agree", null, natsuAsUser).then(function(r) {result = r;},  function(r){result = r});
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Sucessful agree vote: " + result.message);

    processVote("/m/09jy7p7", "disagree", null, natsuAsUser).then(function(r) {result = r;},  function(r){result = r}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Sucessful disagree vote: "  + result.message);

    processVote("/m/09jy7p7", "skip", null, natsuAsUser).then(function(r) {result = r;}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Sucessful skip vote: "  + result.message);

    processVote("/m/0gkhbyy", "agree", "/m/0288nsm", natsuAsUser).then(function(r) {result = r;}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Successful agree vote, item 1: "  + result);

    processVote("/m/0gkhbyy", "agree", "/m/02r2xhk", natsuAsUser).then(function(r) {result = r;}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Successful agree vote, item 2: "  + result);

    processVote("/m/0gkhbyy", "disagree", null, natsuAsUser).then(function(r) {result = r;}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Successful disagree vote: "  + result);

    processVote("/m/0gkhbyy", "skip", null, natsuAsUser).then(function(r) {result = r;}); 
    acre.async.wait_on_results();
    ok(result == voteSJS.success, "Successful skip vote: "  + result);

});

test("processVote - Invalid Voting", function() {
    var result = null;

    // Bad item mid supplied
    processVote("/m/0gkhbyy", "agree", "/user/natsu", natsuAsUser).then(function(r) {result = r;}, function(r){result = r;}); 
    acre.async.wait_on_results();
    ok(result.message == voteSJS.invalidItem, "Bad item mid caught: " + result);

    // Bad flag mid supplied
    processVote("/user/natsu", "agree", "/en/mark_halperin_and_john_f_harris", natsuAsUser).then(function(r) {result = r;}, function(r){result = r}); 
    acre.async.wait_on_results();  
    ok(result.message == voteSJS.invalidFlag, "Caught invalid flag mid: " + result);
});

test("processVote - Invalid Permission", function() {
    var result = null;

    // Not priviledged 
    processVote("/m/0k0ctyh", "agree", "/en/google", natsuAsUser).then(function(r) {result = r;}, function(r){result = r}); 
    acre.async.wait_on_results();
    ok(result.message == voteSJS.lowPermission, "Low permission caught: " + result);

});

acre.test.report();
