# disallow awaits outside of try-catch blocks (no-await-without-trycatch)

Asynchronous function calls might fail. Calls using ES6 async-await syntax should wrap `await` calls in a try-catch block.

## Rule Details

This rule disallows `await` expressions outside of try-catch blocks.

Examples of **incorrect** code for this rule:

```js
/*eslint no-await-without-trycatch: "error"*/
async function f() {
    await g()
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-await-without-trycatch: "error"*/
async function f() {
    try {
        await g()
    } catch (e) {
        // handle the error
    }
}
```

## Recommendation

As the use of `await`s may be nested, setting this rule to `warn` rather than `error` may prove to be useful without being overly intrusive.
