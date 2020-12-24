"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/no-throw-sync-func");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("no-throw-sync-func", rule, {
  valid: [{
        // Async function declaration
        code: `
        const f = async () => {
            throw new Error()
        }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Async function object expression
        code: `
            const f = {
                async g() { throw new Error() }
            }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Class declaration
        code: `
            class C {
                constructor() {
                    throw new Error()
                }
            }`,
            parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Promise-chaining with synchronous arrow expression
        code: `
            Promise.resolve().then(() => {
                throw new Error()
            })`,
            parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Promise-chaining with synchronous function expression
        code: `
            Promise.resolve().then(function () {
                throw new Error()
            })`,
            parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }],
  invalid: [
    {
      // Synchronous function declaration
      code: `
        function f() {
            throw new Error()
        }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
      errors: [
        { message: "Errors from synchronous function declarations should be returned instead" }
      ],
    }, {
        // Synchronous function object expression
        code: `const f = {
            g(x) {
                throw new Error()
            }
        }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Errors from synchronous functions in object expressions should be returned instead" }
        ],
    }, {
        // Synchronous arrow declaration
        code: `
        const f = () => {
            throw new Error()
        }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Errors from synchronous arrow function declaration should be returned instead" }
        ]
    }]
});
