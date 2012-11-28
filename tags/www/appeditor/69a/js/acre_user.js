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

var AcreUser;

(function(){
    
    AcreUser = function(store, properties) {
        this._store     = store;
        this._name      = properties.name      || null;
        this._full_name = properties.full_name || null;
        this._is_admin  = properties.admin;

        return this;
    };
    
    AcreUser.prototype.destroy = function() {
        var self = this;
        self = null;
    };
    
    AcreUser.prototype.get_name = function() {
        return this._name;
    };
    
    AcreUser.prototype.get_full_name = function() {
        return this._full_name;
    };
    
    AcreUser.prototype.is_admin = function() {
        return !!this._is_admin;
    };
    
    AcreUser.prototype.get_image_url = function() {
        return this._store.get_user_image_url(this);
    };
    
    AcreUser.prototype.get_view_url = function() {
        return this._store.get_user_view_url(this);
    };
    
    AcreUser.prototype.get_new_app_host = function() {
        return this._store.get_user_default_app_host(this);
    };
    
    AcreUser.prototype.get_new_app_path = function(path) {
        return this._store.get_user_new_app_path(this, path);   
    };
    

})();
