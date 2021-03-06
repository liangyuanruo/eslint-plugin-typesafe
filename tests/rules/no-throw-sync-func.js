"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/no-throw-sync-func");
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const eslintTester = new RuleTester();

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
    }, {
        // Switch statement in async function
        code: `
            async function f(x){
                switch(x) {
                    default:
                        throw new Error()
                }
            }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Switch statement in async arrow function expression
        code: `
            const f = async (x) => {
                switch(x) {
                    default:
                        throw new Error()
                }
            }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Class constructor with async instance method
        code: `
            class C {
                constructor(){
                    throw new Error()
                }
            
                async f() {
                    throw new Error()
                }
            }
        `,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
    }, {
        // Class constructor with async static method
        code: `
            class C {
                constructor(){
                    throw new Error()
                }
            
                static async f() {
                    throw new Error()
                }
            }
        `,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
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
        { message: "Synchronous function declarations should return an instance of Error instead of throwing." }
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
            { message: "Synchronous functions in object properties should return an instance of Error instead of throwing." }
        ],
    }, {
        // Synchronous arrow declaration
        code: `
        const f = () => {
            throw new Error()
        }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Synchronous arrow function expressions should return an instance of Error instead of throwing." }
        ]
    }, {
        // Switch statement in synchronous function
        code: `
            function f(x){
                switch(x) {
                    default:
                        throw new Error()
                }
            }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Synchronous function declarations should return an instance of Error instead of throwing." }
        ]
    }, {
        // Switch statement in arrow function expression
        code: `
            const f = (x) => {
                switch(x) {
                    default:
                        throw new Error()
                }
            }`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Synchronous arrow function expressions should return an instance of Error instead of throwing." }
        ]
    }, {
        // Class with synchronous instance method
        code: `
            class C {
                f() {
                    throw new Error()
                }
            }
        `,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Synchronous methods should return an instance of Error instead of throwing." }
        ]
    }, {
        // Class with synchronous static method
        code: `
            class C {
                static f() {
                    throw new Error()
                }
            }
        `,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
            { message: "Synchronous methods should return an instance of Error instead of throwing." }
        ]
    }]
});
