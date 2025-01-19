((global, exports) => {
    const HTTP_REGEX = /^https?:/i,
        packagesByName = new Map();
    
    class Package {
        constructor(paths) {
            this.paths = paths;
            this.dependencies = new Set();
        }
        
        // Functions found in manifest files
        provides(...names) {
            for (const name of names) packagesByName.set(name, this);
            return this;
        }
        requires(...names) {
            for (const name of names) this.dependencies.add(name);
            return this;
        }
    }
    
    exports.Packages = manifestFunc => {
        manifestFunc(
            // The "file" function used inside the manifestFunc.
            (...filePaths) => new Package(filePaths.map(filePath => !HTTP_REGEX.test(filePath) && exports.ROOT ? exports.ROOT + '/' + filePath : filePath))
        );
    };
    exports.ENV = global;
    exports.extractFilePaths = names => {
        const resolvedPackages = new Set(),
            resolveDependencies = packageName => {
                const pkg = typeof packageName === 'string' ? packagesByName.get(packageName) : packageName;
                if (!pkg) throw new Error('Package not found: ' + packageName);
                
                for (const dep of pkg.dependencies) {
                    if (!resolvedPackages.has(dep)) resolveDependencies(dep);
                }
                resolvedPackages.add(pkg);
            };
        
        for (const name of names) resolveDependencies(name);
        
        // Extract the file paths out of the packages list. This is necessary because each file() 
        // declaration in the manifest file can declare more than one file.
        const filePaths = [];
        for (const pkg of resolvedPackages) {
            if (!Array.isArray(pkg.paths)) throw new Error('Cannot bundle ' + pkg + ': no path specified in manifest');
            for (const path of pkg.paths) {
                if (!HTTP_REGEX.test(path)) filePaths.push(path);
            }
        }
        return filePaths;
    };
})(global, exports);

