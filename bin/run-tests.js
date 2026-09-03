#!/usr/bin/env node

/*  Headless runner for the QUnit test files in src/test/tests.

    Runs the existing QUnit 1.x test files under Node using jsdom, so no browser
    is needed. Loads dist/myt.js, so run a build first if you've changed src.

    Usage:
      node bin/run-tests.js              Run the DOM-independent suites (default)
      node bin/run-tests.js --all        Also run the suites that need real layout
      node bin/run-tests.js --verbose    Show framework console output
      node bin/run-tests.js <file>...    Run specific test files

    Exits 1 if any assertion fails, so it can gate a build or CI step.

    Note on --all: jsdom implements the DOM but performs no layout, so
    offsetLeft/offsetWidth/getBoundingClientRect are always 0. The view suites
    therefore report failures that a real browser would not. Those suites still
    need src/test/test_runtime_src.html in a browser. */

const fs = require('fs'),
    path = require('path'),
    {JSDOM, VirtualConsole} = require('jsdom'),
    
    ROOT = path.resolve(__dirname, '..'),
    TEST_ROOT = path.join(ROOT, 'src/test/tests'),
    MYT_DIST = path.join(ROOT, 'dist/myt.js'),
    
    // Suites that pass under jsdom because they don't depend on layout.
    DOM_INDEPENDENT = [
        'core/test-ClassSystem.js',
        'core/test-Node.js',
        'core/test-Node_placement.js',
        'core/test-Observable.js',
        'core/test-Observer.js',
        'core/test-myt.js',
        'util/test-Cookie.js',
        'util/test-Geometry.js',
        'util/test-URI.js',
        'shim/test-language.js',
        'component/test-BoundedRangeComponent.js',
        'component/test-Path.js',
        'component/test-Color.js',
        'component/test-ExpressionParser.js'
    ],
    
    // Suites that need real layout or a real user agent. Run with --all.
    NEEDS_BROWSER = [
        'core/test-myt-dom.js',
        'core/view/test-DomElementProxy.js',
        'core/view/test-View.js'
    ],
    
    // Minimal QUnit 1.x globals. The test files use the old global-function
    // style, so this is all that's needed to run them unmodified.
    QUNIT_SHIM = `
        globalThis.__qunit = {pass:0, fail:0, failures:[], currentModule:'', currentTest:''};
        globalThis.module = name => {__qunit.currentModule = name;};
        globalThis.test = (name, fn) => {
            __qunit.currentTest = name;
            try {
                fn();
            } catch (e) {
                __qunit.fail++;
                __qunit.failures.push(name + ' -- THREW: ' + e.message);
            }
        };
        globalThis.asyncTest = globalThis.test;
        globalThis.start = globalThis.stop = globalThis.expect = () => {};
        globalThis.__assert = (cond, msg, detail) => {
            if (cond) {
                __qunit.pass++;
            } else {
                __qunit.fail++;
                __qunit.failures.push(__qunit.currentTest + ' -- ' + (msg ?? '(no message)') + (detail ?? ''));
            }
        };
        globalThis.ok = (c, m) => __assert(!!c, m);
        globalThis.equal = (a, b, m) => __assert(a == b, m, ' [' + a + ' != ' + b + ']');
        globalThis.notEqual = (a, b, m) => __assert(a != b, m, ' [' + a + ' == ' + b + ']');
        globalThis.strictEqual = (a, b, m) => __assert(a === b, m, ' [' + a + ' !== ' + b + ']');
        globalThis.notStrictEqual = (a, b, m) => __assert(a !== b, m);
        globalThis.deepEqual = (a, b, m) => __assert(JSON.stringify(a) === JSON.stringify(b), m);
        globalThis.notDeepEqual = (a, b, m) => __assert(JSON.stringify(a) !== JSON.stringify(b), m);
        globalThis.throws = (fn, _x, m) => {
            try {fn(); __assert(false, m);} catch (e) {__assert(true, m);}
        };
    `;

const readSource = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const runSuite = (mytSource, testFile, verbose) => {
    // Several suites deliberately trigger myt warnings (event loop protection,
    // double destroy). Swallow them unless --verbose, so output stays readable.
    const virtualConsole = new VirtualConsole();
    if (verbose) virtualConsole.sendTo(console);
    
    const dom = new JSDOM(
        '<!doctype html><html><body><div id="testDiv"></div></body></html>',
        {url:'https://example.com/test/', pretendToBeVisual:true, runScripts:'outside-only', virtualConsole}
    );
    const win = dom.window;
    try {
        // jsdom has no ResizeObserver. myt's idle loop touches it during setup.
        win.ResizeObserver ??= class {observe() {} unobserve() {} disconnect() {}};
        win.eval(QUNIT_SHIM);
        win.eval(mytSource);
        win.eval(readSource(testFile));
        return win.__qunit;
    } catch (e) {
        return {pass:0, fail:1, failures:['COULD NOT LOAD: ' + e.message]};
    } finally {
        // Stop jsdom's rAF/timer loop so the process can exit.
        win.close();
    }
};

const main = () => {
    if (!fs.existsSync(MYT_DIST)) {
        console.error('Missing ' + path.relative(ROOT, MYT_DIST) + '. Run: npm run build-myt');
        process.exit(1);
    }
    
    const args = process.argv.slice(2),
        runAll = args.includes('--all'),
        verbose = args.includes('--verbose'),
        explicit = args.filter(arg => !arg.startsWith('--'));
    
    let suites;
    if (explicit.length > 0) {
        suites = explicit.map(f => path.resolve(f));
    } else {
        suites = DOM_INDEPENDENT.concat(runAll ? NEEDS_BROWSER : [])
            .map(f => path.join(TEST_ROOT, f));
    }
    
    const mytSource = readSource(MYT_DIST);
    let totalPass = 0,
        totalFail = 0;
    const failedSuites = [];
    
    for (const suite of suites) {
        const label = path.relative(TEST_ROOT, suite);
        if (!fs.existsSync(suite)) {
            console.log('  ?? ' + label.padEnd(42) + 'not found');
            totalFail++;
            failedSuites.push(label);
            continue;
        }
        
        const result = runSuite(mytSource, suite, verbose);
        totalPass += result.pass;
        totalFail += result.fail;
        
        console.log(
            '  ' + (result.fail === 0 ? 'ok  ' : 'FAIL') + ' ' + label.padEnd(42) +
            String(result.pass).padStart(4) + ' passed' +
            (result.fail ? ', ' + result.fail + ' failed' : '')
        );
        if (result.fail > 0) {
            failedSuites.push(label);
            for (const failure of result.failures) console.log('         ' + failure);
        }
    }
    
    console.log('\n' + totalPass + ' assertions passed, ' + totalFail + ' failed, ' + suites.length + ' suites');
    if (!runAll && explicit.length === 0) {
        console.log('(' + NEEDS_BROWSER.length + ' layout-dependent suites skipped; --all to include, or use test_runtime_src.html in a browser)');
    }
    
    process.exit(totalFail > 0 ? 1 : 0);
};

main();