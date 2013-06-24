To build a single javascript file run the following from the myt root dir:
  > jsbuild -m src/js/myt/manifest.js -P -r ./src/js myt.SimpleListView > src/js/myt/myt.js

To build a minified javascript file run the following from the myt root dir:
  > bin/build src/js/myt/manifest.js src/js/myt/myt.js ./src/js myt.all > src/js/myt/myt.min.js

Starting up JSTestDriver from the myt dir:
  > nohup java -jar src/test/jstestdriver/JsTestDriver.jar --port 8081 >dev/null>&1 &
  
  To bring it back to the foreground:
  > fg
  
  Then you can ctrl-c to close it.

Running the tests via JSTestDriver from the myt root dir:
  > java -jar src/test/jstestdriver/JsTestDriver.jar -–config src/test/JsTestDriver.conf --server http://localhost:8081 --tests all --reset
