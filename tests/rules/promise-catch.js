"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/promise-catch");
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const eslintTester = new RuleTester();

eslintTester.run("promise-catch", rule, {
  valid: [
    {
        // Promise must end with catch
        code: `
        async function y() {
            try {
                await z()
            } catch (e) {
                console.error(e)
            }
        }
        
        y().catch(e => console.error(e))`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Promise chains must end with catch
        code: `
        async function y() {
            try {
                await z()
            } catch (e) {
                console.error(e)
            }
        }
        
        y().then(x => x).catch(e => console.error(e))`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }, {
        // Allow interleaving catch
        code: `
        async function y() {
            try {
                await z()
            } catch (e) {
                console.error(e)
            }
        }
        
        y().catch(e => console.error(e)).then(x => x).catch(e => console.error(e))`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" }
    }
  ],
  invalid: [
    {
      // Missing catch
      code: `
        async function y() {
            const x = await z()
            return x
        }
        
        y()`,
        parserOptions: { ecmaVersion: 8, sourceType: "module" },
      errors: [
        { message: "Missing catch statement." }
      ],
    }, {
        // Dangling "then" expression at the end
        code: `
          async function abc () {
              const x = await z()
              return x
          }
          
          abc().then(x => x)`,
          parserOptions: { ecmaVersion: 8, sourceType: "module" },
        errors: [
          { message: "Missing catch statement." }
        ],
      }
  ]
});
