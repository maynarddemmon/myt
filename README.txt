---[ Installation Notes ]-------------------------------------------------------
Building the dist files makes use of Node, NPM and google-closure-compiler.
Do the following from the myt root directory. If you already have node and npm
skip to step 3.

1) To install node try:
  > nvm install 16.14.2

2) To Install NPM try:
  > npm install -g npm

3) Then update the required npm packages:
  > npm update

4) To create the dist files:
  > npm run-script build-loader
  > npm run-script build-myt

You should now see the following files in the dist directory:
  > ls dist
  
  loader-browser.min.js
  loader-browser.min.js.map
  myt.js
  myt.min.js
  myt.min.js.map

---[ Examples ]-----------------------------------------------------------------
Examples can be found here: https://maynarddemmon.github.io/myt/examples/
