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
