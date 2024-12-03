((global, exports) => {
    const HTTP_REGEX = /^https?:/i,
        
        pkgByName = {},
        
        Package = exports.Package = function(paths) {
            const self = this,
                deps = self._deps = new Set();
            self._paths = paths;
            
            // Functions found in manifest files
            self.provides = (...args) => {
                for (const name of args) pkgByName[name] = self;
                return self;
            };
            self.requires = (...args) => {
                for (const name of args) deps.add(name);
                return self;
            };
        };
    
    Package.ENV = exports.ENV = global;
    Package.extractFilePaths = names => {
        const packages = new Set(),
            expand = nameOrPkg => {
                const pkg = typeof nameOrPkg === 'string' ? pkgByName[nameOrPkg] : nameOrPkg;
                for (const dep of pkg._deps) expand(dep);
                packages.add(pkg);
            };
        for (const name of names) expand(name);
        
        // Extract the file paths out of the packages list. This is necessary because each file() 
        // declaration in the manifest file can declare more than one file.
        const includedFiles = [];
        for (const pkg of packages) {
            if (!Array.isArray(pkg._paths)) throw new Error('Cannot bundle ' + pkg + ': no path specified in your manifest');
            for (const path of pkg._paths) {
                if (!HTTP_REGEX.test(path)) includedFiles.push(path);
            }
        };
        return includedFiles;
    };
    
    exports.Packages = manifestFunc => {
        manifestFunc(
            // The "file" function used inside the manifestFunc.
            (...args) => new Package(args.map(filename => !HTTP_REGEX.test(filename) && exports.ROOT ? exports.ROOT + '/' + filename : filename))
        );
    };
})(global, exports);
