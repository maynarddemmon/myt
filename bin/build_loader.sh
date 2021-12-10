#!/bin/bash
# It is expected that you will run this from the directory above this one.
java -Xmx256m -jar bin/closure-compiler/compiler_v20211201.jar --js src/js/jsclass/loader-browser.js --language_out ECMASCRIPT_2021 --jscomp_warning=lintChecks --js_output_file dist/loader-browser.min.js --source_map_format=V3 --create_source_map dist/loader-browser.min.js.map --output_wrapper "%output%
//# sourceMappingURL=./loader-browser.min.js.map"

stat -f%z ./dist/loader-browser.min.js
