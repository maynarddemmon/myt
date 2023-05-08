(pkg => {
    const localStorage = global.localStorage,
        
        getStoreId = storeId => storeId = storeId ?? 'myt',
        
        doFunc = (func, delay, timerKey) => {
            if (delay > 0) {
                const timerIdKey = '__timerId_' + timerKey,
                    timerId = LocalStorage[timerIdKey];
                if (timerId) clearTimeout(timerId);
                
                LocalStorage[timerIdKey] = setTimeout(() => {
                    func();
                    delete LocalStorage[timerIdKey];
                }, delay);
            } else {
                func();
            }
        },
        
        /** Browser local storage utility functions.
            
            The Data methods utilize a single JSON object to store multiple 
            values under a single local storage item.
            
            @class */
        LocalStorage = pkg.LocalStorage = {
            /** Check if data has been stored under the key and storage id.
                @param {string} key - The key to look for.
                @param {string} [storeId] - The id of the data store to look 
                    in. If not provided the default "myt" storeId will be used.
                @returns {boolean} - false if an undefined or null value is 
                    found, otherwise true. */
            hasDatum: (key, storeId) => {
                if (key) {
                    const data = LocalStorage.getItem(getStoreId(storeId));
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
                @param {string} key - The key to get data for.
                @param {string} [storeId] - The id of the data store to get 
                    data for. If not provided the default "myt" storeId will 
                    be used.
                @returns {*} the value of the data or undefined if the
                    datum was not found. */
            getDatum: (key, storeId) => {
                if (key) {
                    const data = LocalStorage.getItem(getStoreId(storeId));
                    if (data) {
                        try {
                            const jsonData = JSON.parse(data);
                            if (typeof jsonData === 'object') return jsonData[key];
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            },
            
            /** Sets a single entry in a data store.
                @param {string} key - The key to store the value under.
                @param {*} value - The value to store.
                @param {string} [storeId] - The id of the data store to put 
                    data in. If not provided the default "myt" storeId will 
                    be used.
                @param {number} [delay] - A number of millis to wait before
                    actually storing the data. This can be useful to prevent 
                    excessive numbers of writes when a value will be set a 
                    large number of times over a short time interval. For 
                    example, when saving the position of a UI control as it 
                    is being repositioned or a value the user is typing.
                @returns {undefined} */
            setDatum: (key, value, storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {
                    const data = LocalStorage.getData(storeId);
                    data[key] = value;
                    LocalStorage.setItem(storeId, JSON.stringify(data));
                }, delay, storeId + '___' + key);
            },
            
            /** Removes a single entry in a data store.
                @param {string} key - The key to remove the entry for.
                @param {string} [storeId] - The id of the data store to remove 
                    data from. If not provided the default "myt" storeId will 
                    be used.
                @param {number} [delay] - A number of millis to wait before
                    actually removing the data.
                @returns {undefined} */
            removeDatum: (key, storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {
                    const data = LocalStorage.getData(storeId);
                    delete data[key];
                    LocalStorage.setItem(storeId, JSON.stringify(data));
                }, delay, storeId + '___' + key);
            },
            
            /** Check if data has been stored under the storage id.
                @param {string} [storeId] - THe id of the data store to look 
                    in. If not provided the default "myt" storeId will be used.
                @returns {boolean} - false if an undefined or null value is 
                    found, otherwise true. */
            hasData: storeId => LocalStorage.getItem(getStoreId(storeId)) != null,
            
            /** Get the data store stored under storage id.
                @param {string} [storeId] - The id of the data store to get 
                    data for. If not provided the default "myt" storeId will 
                    be used.
                @returns {!Object} - The store object. */
            getData: storeId => {
                const data = LocalStorage.getItem(getStoreId(storeId));
                if (data) {
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        console.error(e);
                    }
                }
                return {};
            },
            
            /** Store data under the storage id. This replaces an entire data 
                store with the new data object.
                @param {?Object} [data] - The data object to store under the 
                    storage id.
                @param {string} [storeId] - The id of the data store to put 
                    data in. If not provided the default "myt" storeId will 
                    be used.
                @param {number} [delay] - A number of millis to wait before
                    actually storing the data. This can be useful to prevent 
                    excessive numbers of writes when a value will be set a 
                    large number of times over a short time interval. For 
                    example, when saving the position of a UI control as it 
                    is being repositioned or a value the user is typing.
                @returns {boolean} - true if the data is of type object 
                    false otherwise. */
            setData: (data, storeId, delay) => {
                storeId = getStoreId(storeId);
                
                data ??= {};
                
                if (typeof data === 'object') {
                    doFunc(() => {LocalStorage.setItem(storeId, JSON.stringify(data));}, delay, storeId);
                    return true;
                }
                
                return false;
            },
            
            /** Removes a data store.
                @param {string} [storeId] - The id of the data store to 
                    remove. If not provided the default "myt" storeId will 
                    be used.
                @param {number} [delay] - A number of millis to wait before
                    actually removing the data.
                @returns {undefined} */
            removeData: (storeId, delay) => {
                storeId = getStoreId(storeId);
                doFunc(() => {LocalStorage.removeItem(storeId);}, delay, storeId);
            },
            
            // wrapper functions on localStorage
            /** @returns {number} - The number of data items stored in the 
                    Storage object. */
            getLength: () => localStorage.length,
            
            /** @param {number} n - The index of the key name to retrieve.
                @returns {string} The name of the nth key in the storage. */
            getKey: n => localStorage.key(n),
            
            /** @param {string} key - The name of the storage entry to return.
                @returns {*} - The value of the storage entry or null if 
                    not found. */
            getItem: key => localStorage.getItem(key),
            
            /** Stores the value under the key. If a value already exists for
                the key the value will be replaced with the new value.
                @param {string} key - The key to store the value under.
                @param {*} value - The value to store.
                @returns {undefined} */
            setItem: (key, value) => {
                localStorage.setItem(key, value);
            },
            
            /** Removes the storage entry for the key.
                @param {string} key - The key to remove.
                @returns {undefined} */
            removeItem: key => {
                localStorage.removeItem(key);
            },
            
            /** Removes all storage entries.
                @returns {undefined} */
            clear: () => {
                localStorage.clear();
            },
            
            // Aliases for better API compatibility with some libraries.
            /** An alias for getItem.
                @param {string} key - The name of the storage entry to return.
                @returns {*} - The value of the storage entry or null if 
                    not found. */
            get: key => LocalStorage.getItem(key),
            
            /** An alias for setItem.
                @param {string} key - The key to store the value under.
                @param {*} value - The value to store.
                @returns {undefined} */
            set: (key, value) => {
                LocalStorage.setItem(key, value);
            },
            
            /** An alias for removeItem.
                @param {string} key - The key to remove.
                @returns {undefined} */
            remove: key => {
                LocalStorage.removeItem(key);
            },
            
            /** An alias for clear.
                @returns {undefined} */
            clearAll: () => {
                LocalStorage.clear();
            }
        };
})(myt);
