# Myt

A small, dependency-free JavaScript UI framework for building browser applications.

Myt gives you persistent view objects rather than a render-and-diff cycle. A
`myt.View` owns a DOM element for its lifetime, setters write to that element
immediately, and every element carries a `model` back-reference to the view that
owns it. That can make it easier to debug since you can select a node in dev 
tools, jump straight to the object behind it, and trace a visual change back 
to the call that caused it.

It has no runtime dependencies, patches nothing global beyond a single guarded
`Date.prototype.format`, attaches no document-level event delegation, and never
touches `history` or `location`. That makes it well behaved on a page shared with
other frameworks.

## What's in it

- **Core** — a class system with mixins and `callSuper`, an observable/observer
  event layer, declarative constraints that keep a value in sync with the things
  it depends on, and a node hierarchy with lifecycle management.
- **Views and layout** — `View` plus layouts (`Variable`, `Spaced`, `Aligned`,
  `Wrapping`, `Resize`, `Constant`) and sizing mixins (`SizeToParent`,
  `SizeToChildren`, `SizeToWindow`).
- **Animation** — an `Animator` driven by an idle loop, with a full easing library.
- **Components** — `Button`, `Checkbox`, `Radio`, `Slider`, `Dialog`, `Grid`,
  `InfiniteList`, `Tab`, `TabSlider`, `Tooltip`, `Uploader`, `FloatingPanel`,
  `Spinner`, `Growl`, `Divider`, `PanelStack`, `StateMachine`, `Validator`,
  `DragAndDrop`, `SelectionManager`, `Canvas`, `SVG`, `Path`, `Annulus`,
  `RadialGauge`, `Color`, and more.
- **tym.js** — a micro version of Myt for use in Node. It contains only the 
  core: the class system, the observable/observer layer, Node, and the object 
  pools. Nothing that touches the DOM.

## Examples

Live examples: **https://maynarddemmon.github.io/myt/examples/**

The same files are in [`examples/`](examples/) and can be opened directly from a
local checkout once you have built the dist files. `examples/index.html` links to
all of them. Good starting points are `simple_views.html` for the basics,
`layout.html` for the layout system, and `form.html` for the component set.

## Using Myt in a page

Load the built framework, then build your UI:

```html
<!doctype html><html><head>
<link rel="stylesheet" href="src/css/myt.css"/>
<script src="dist/myt.min.js"></script>
</head><body>
<script>
    const v = new myt.View(null, {
        x:10, y:20, width:200, height:100, bgColor:'#999999'
    }, [myt.RootView]);
    
    new myt.View(v, {
        bgColor:'#eeeeee', width:50, height:50, align:'right', valign:'bottom'
    });
</script>
</body></html>
```

During development you can instead load unbuilt source through the package
loader, which gives you real file names and line numbers in the debugger. See any
file in `examples/` for that setup.

## Building

Building the dist files uses Node, npm and google-closure-compiler.

**Requirements:** Node 20.12 or later. The build and test scripts currently
assume macOS or Linux.

From the repository root:

```bash
# 1. Install the dev dependencies.
npm install

# 2. Build everything, then run the tests and the linter.
npm run enchilada
```

You should now see these files in `dist/`:

```
loader-browser.js          myt.js          tym.js
loader-browser.min.js      myt.min.js      tym.min.js
loader-browser.min.js.map  myt.min.js.map  tym.min.js.map
```

### Individual scripts

| Script | What it does |
| --- | --- |
| `npm run enchilada` | Everything below, in dependency order. |
| `npm run build-myt` | Builds `dist/myt.js` and `dist/myt.min.js`. |
| `npm run build-loader` | Builds the development package loader. |
| `npm run build-tym` | Builds `tym`, a stripped down Myt for Node. |
| `npm run build-expressionParser` | Regenerates the constraint expression parser from its grammar. |
| `npm test` | Runs the test suite headlessly. |
| `npm run test-all` | Runs all test suites including those that need a real browser. |
| `npm run lint` | Runs ESLint over `src`. |

A build that would produce no change other than a new version stamp is skipped
entirely, so rebuilding without editing anything leaves `dist/` untouched.

## Tests

```bash
npm test
```

This runs the QUnit suites under jsdom with no browser required, and exits
non-zero on failure so it can gate a build.

Three suites depend on real layout — jsdom implements the DOM but performs no
layout, so `offsetWidth` and friends are always `0` there. Those are skipped by
default and are marked `needsBrowser` in
[`src/test/test-manifest.js`](src/test/test-manifest.js). To run everything,
open `src/test/test_runtime_src.html` (unbuilt source) or
`src/test/test_minified_src.html` (built) in a browser.

To add a test, drop the file in `src/test/tests/` and add one line to
`src/test/test-manifest.js`. All three runners read that list.

## License

MIT. See [LICENSE.txt](LICENSE.txt).

## Roadmap/Todos

A bunch of things I've considered adding at one time or another. Some of these might not event be
a good idea to implement.

- JS.Class
  - Configure name for "callSuper", "initialize", "extend", etc.
  - Call super on other superclass methods.

- Myt
  - Send mouse out to last "over" view if two overs happen in a row. Browser Bugfix: firefox
  - Replication/repeat. See AngularJS ngRepeat for inspiration.
  - List components
      - Item tiling and pooling
  - Offset hint for layout
  - Target a hint to a specific layout when a view is controlled by multiple layouts.
  - Use Z-index for bring to front
  - Dialog should support multiple entries for spinner message using a key to add/remove them.
  - Build in delay to showSpinner code.
