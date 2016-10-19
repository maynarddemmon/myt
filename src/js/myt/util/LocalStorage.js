/** Browser local storage utility functions.
    
    The Data methods utilize a single JSON object to store multiple values
    under a single local storage item.
*/
myt.LocalStorage = {
    // Methods /////////////////////////////////////////////////////////////////
    /** Check if data has been stored under the key and storage id.
        @param key:string the key to look for.
        @param storeId:string (optional) id of the data store to look in. If
            not provided the default "myt" storeId will be used.
        @returns boolean false if an undefined or null value is found,
            otherwise true. */
    hasDatum: function(key, storeId) {
        if (key) {
            var LS = myt.LocalStorage,
                data = LS.getItem(LS._getStoreId(storeId));
            if (data) {
                try {
                    return JSON.parse(data)[key] != null;
                } catch (e) {
                    console.error(e);
                    return false;
                }
            }
        }
        return false;
    },
    
    /** Get the data stored under the key and storage id.
        @param key:string the key to get data for.
        @param storeId:string (optional) id of the data store to get data for.
            If not provided the default "myt" storeId will be used.
        @returns the value of the data or undefined if not found. */
    getDatum: function(key, storeId) {
        if (key) {
            var LS = myt.LocalStorage,
                data = LS.getItem(LS._getStoreId(storeId));
            if (data) {
                try {
                    data = JSON.parse(data);
                    if (typeof data === 'object') return data[key];
                } catch (e) {
                    console.error(e);
                }
            }
        }
    },
    
    /** Sets a single entry in a data store.
        @param key:string The key to store the value under.
        @param value:* The value to store.
        @param storeId:string (optional) id of the data store to put data in.
            If not provided the default "myt" storeId will be used.
        @param delay:number (optional) A number of millis to wait before
            actually storing the data. This can be useful to prevent excessive
            numbers of writes when a value will be set a large number of times
            over a short time interval. For example, when saving the position
            of a UI control as it is being repositioned or a value the user
            is typing.
        @returns void */
    setDatum: function(key, value, storeId, delay) {
        var LS = myt.LocalStorage;
        storeId = LS._getStoreId(storeId);
        LS._doFunc(function() {
            var data = LS.getData(storeId);
            data[key] = value;
            LS.setItem(storeId, JSON.stringify(data));
        }, delay, storeId + '___' + key);
    },
    
    /** Removes a single entry in a data store.
        @param key:string The key to remove the entry for.
        @param storeId:string (optional) id of the data store to remove data 
            from. If not provided the default "myt" storeId will be used.
        @param delay:number (optional) A number of millis to wait before
            actually removing the data.
        @returns void */
    removeDatum: function(key, storeId, delay) {
        var LS = myt.LocalStorage;
        storeId = LS._getStoreId(storeId);
        LS._doFunc(function() {
            var data = LS.getData(storeId);
            delete data[key];
            LS.setItem(storeId, JSON.stringify(data));
        }, delay, storeId + '___' + key);
    },
    
    /** Check if data has been stored under the storage id.
        @param storeId:string (optional) id of the data store to look in. If
            not provided the default "myt" storeId will be used.
        @returns boolean false if an undefined or null value is found,
            otherwise true. */
    hasData: function(storeId) {
        var LS = myt.LocalStorage;
        return LS.getItem(LS._getStoreId(storeId)) != null;
    },
    
    /** Get the data store stored under storage id.
        @param storeId:string (optional) id of the data store to get data for.
            If not provided the default "myt" storeId will be used.
        @returns the store object. */
    getData: function(storeId) {
        var LS = myt.LocalStorage,
            data = LS.getItem(LS._getStoreId(storeId));
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error(e);
            }
        }
        return {};
    },
    
    /** Store data under the storage id. This replaces an entire data store
        with the new data object.
        @param data:object (optional) The data object to store under the 
            storage id.
        @param storeId:string (optional) id of the data store to put data in.
            If not provided the default "myt" storeId will be used.
        @param delay:number (optional) A number of millis to wait before
            actually storing the data. This can be useful to prevent excessive
            numbers of writes when a value will be set a large number of times
            over a short time interval. For example, when saving the position
            of a UI control as it is being repositioned or a value the user
            is typing.
        @returns boolean true if the data is of type object false otherwise. */
    setData: function(data, storeId, delay) {
        var LS = myt.LocalStorage;
        storeId = LS._getStoreId(storeId);
        
        if (data == null) data = {};
        
        if (typeof data === 'object') {
            LS._doFunc(function() {LS.setItem(storeId, JSON.stringify(data));}, delay, storeId);
            return true;
        }
        
        return false;
    },
    
    /** Removes a data store.
        @param storeId:string (optional) id of the data store to remove. If 
            not provided the default "myt" storeId will be used.
        @param delay:number (optional) A number of millis to wait before
            actually removing the data.
        @returns void */
    removeData: function(storeId, delay) {
        var LS = myt.LocalStorage;
        storeId = LS._getStoreId(storeId);
        LS._doFunc(function() {LS.removeItem(storeId);}, delay, storeId);
    },
    
    /** @private */
    _doFunc: function(func, delay, timerKey) {
        if (delay > 0) {
            var LS = myt.LocalStorage,
                timerIdKey = '__timerId_' + timerKey,
                timerId = LS[timerIdKey];
            if (timerId) clearTimeout(timerId);
            
            LS[timerIdKey] = setTimeout(function() {
                func();
                delete LS[timerIdKey];
            }, delay);
        } else {
            func();
        }
    },
    
    /** @private */
    _getStoreId: function(storeId) {
        return storeId = storeId || 'myt';
    },
    
    // wrapper functions on localStorage
    /** @returns The number of data items stored in the Storage object. */
    getLength: function() {
        return window.localStorage.length;
    },
    
    /** @param n:integer The index of the key name to retrieve.
        @returns The name of the nth key in the storage. */
    getKey: function(n) {
        return window.localStorage.key(n);
    },
    
    /** @param key:string The name of the storage entry to return.
        @returns The value of the storage entry or null if not found. */
    getItem: function(key) {
        return window.localStorage.getItem(key);
    },
    
    /** Stores the value under the key. If a value already exists for
        the key the value will be replaced with the new value.
        @param key:string The key to store the value under.
        @param value:* The value to store.
        @returns void */
    setItem: function(key, value) {
        window.localStorage.setItem(key, value);
    },
    
    /** Removes the storage entry for the key.
        @param key:string The key to remove.
        @returns void */
    removeItem: function(key) {
        window.localStorage.removeItem(key);
    },
    
    /** Removes all storage entries.
        @returns void */
    clear: function() {
        window.localStorage.clear();
    }
};
