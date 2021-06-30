#!/bin/bash
# It is expected that you will run this from the directory above this one.
bin/build src/js/myt/manifest.js dist/myt.js ./src/js true myt.all

stat -f%z ./dist/myt.min.js
