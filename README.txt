Examples can be found here: http://maynarddemmon.github.io/myt/examples/

To create the dist files run the following from the myt root dir:
  > bin/build src/js/myt/manifest.js dist/myt.js ./src/js false myt.all

If you want to output a source map too do change the "false" to "true":
  > bin/build src/js/myt/manifest.js dist/myt.js ./src/js true myt.all

To build a single javascript file run the following from the myt root dir:
  > jsbuild -m src/js/myt/manifest.js -P -r ./src/js false myt.SimpleListView

Starting up JSTestDriver from the myt dir:
  > nohup java -jar src/test/jstestdriver/JsTestDriver.jar --port 8081 >dev/null>&1 &
  
  To bring it back to the foreground:
  > fg
  
  Then you can ctrl-c to close it.

Running the tests via JSTestDriver from the myt root dir:
  > java -jar src/test/jstestdriver/JsTestDriver.jar -–config src/test/JsTestDriver.conf --server http://localhost:8081 --tests all --reset
