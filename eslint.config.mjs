import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                
                JS: 'readonly',
                myt: 'readonly',
                tym: 'readonly',
                
                // Not yet in the globals package.
                Sanitizer: 'readonly',
                
                // QUnit 1.x, used by the files in src/test/tests.
                QUnit: 'readonly',
                test: 'readonly',
                ok: 'readonly',
                deepEqual: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-undef': 'warn',
            'no-extra-boolean-cast': 'off', // if (!!someVar) {   // }
            'no-constant-condition': ['warn', {checkLoops: false}], // while (true) {}
            'no-useless-escape': 'off',
            'no-cond-assign': 'off' // if(a = b)
        }
    }
];