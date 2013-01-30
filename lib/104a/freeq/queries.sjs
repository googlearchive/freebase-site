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

var h = acre.require('helper/helpers.sjs');
var apis = acre.require("promise/apis");
var freebase = apis.freebase;
var deferred = apis.deferred;

// Flow for adding and executing tasks is following:
// * create_job Calls FreeQ and creates new named job
// * add_task Add one tasks to job (more tasks can be added to one job)
// * execute_job Turn job in ready state to execute tasks when possible
// OR you can call one of handy functions merge_topics/delete_topics

/**
 * Creates new Job
 * @param  {string=} name Name of a job (optional)
 * @return {lib.promise.deferred.Deferred} A promise for FreeQ call
 * @throw error if fb_writeuser is not enabled
 */
function create_job(name) {
  if(!is_fb_writeuser_enabled()) {
    throw new Error("fb_writeuser is not enabled");
  }
  var query = {
    'name': name || 'Freebase Review Queue'
  };
  var options = {
    'http_sign': 'keystore',
    'query': query
  };
  return freebase.freeq.create_job(options);
}

/**
 * Adds Task to Job
 * @param {!string} job_id Job ID, If null create new Job
 * @param {Object|string} query  Query object or string
 * @param {Boolean=} execute  If True execute job after task
 *     has been added (optional)
 * @return {lib.promise.deferred.Deferred} A promise for FreeQ call
 * @throw error if fb_writeuser is not enabled
 */
function add_task(job_id, query, execute) {
  if(!is_fb_writeuser_enabled()) {
    throw new Error("fb_writeuser is not enabled");
  }
  var options = {
    'http_sign': 'keystore',
    'query': query
  };

  var defer = null;

  if (job_id) {
    // Just add task
    defer = freebase.freeq.add_task(job_id, options).then(function(){
      return { "id": job_id };
    });
  } else {
    // Create new job and then add task
    defer = create_job().then(function(result){
      var job_id = result.id;
      return freebase.freeq.add_task(job_id, options).then(function(){
        return { "id": job_id };
      });
    });
  }

  if (execute) {
    // Call execute_job after adding task
    return defer.then(function(result){
      var job_id = result.id;
      return execute_job(job_id);
    });
  } else {
    return defer;
  }
}

/**
 * Executes Job
 * @param {!string} job_id Job ID
 * @return {lib.promise.deferred.Deferred} A promise for FreeQ call
 * @throw error if fb_writeuser is not enabled
 */
function execute_job(job_id) {
  if(!is_fb_writeuser_enabled()) {
    throw new Error("fb_writeuser is not enabled");
  }
  var query = {};
  var options = {
    'http_sign': 'keystore',
    'query': query,
    'jobStatus': 'running'
  };
  return freebase.freeq.execute_job(job_id, options);
}

/**
 * Merges two topics
 * @param  {string=} job_id   ID of Job to add task to (optional)
 * @param  {!string} target_id MID of a target
 * @param  {!string} source_id MID of a source
 * @param  {boolean=} execute True if the job should
 *     be automatically executed (optional)
 * @return {lib.promise.deferred.Deferred} A promise for adding a task
 * @throw error if fb_writeuser is not enabled
 */
function merge_topics(job_id, target_id, source_id, execute) {
  var query = {
    'merge_topics': [{
      'target_id': target_id,
      'source_id': source_id
    }]
  };
  return add_task(job_id, query, execute);
}

/**
 * Deletes topic by ID
 * @param  {string=} job_id   ID of a Job (optional)
 * @param  {!string} topic_id MID of Topic
 * @param  {boolean=} execute True to execute Job right after add (optional)
 * @return {lib.promise.deferred.Deferred} A promise for adding a task
 * @throw error if fb_writeuser is not enabled
 */
function delete_topic(job_id, topic_id, execute) {
  var query = {'delete_topics': [{
      'topic_id': topic_id
  }]};
  return add_task(job_id, query, execute);
}

/**
 * Returns true if fb_writeuser is enabled.
 * @return {Boolean} Writeuser is enabled
 */
function is_fb_writeuser_enabled() {
  return acre.oauth.providers.freebase_writeuser.writeuser === "fb_writeuser";
}
