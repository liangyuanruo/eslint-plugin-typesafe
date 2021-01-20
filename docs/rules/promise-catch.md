# disallow asynchronous function calls without catch statement (promise-catch)

Promises may fail, resulting in `UnhandledPromiseRejectionWarning`. To avoid this, promise chains should terminate in a `catch` member expression.

## Rule Details

This rule disallows promise chains that do not terminate in a `catch` expression, when it can detect it.

Examples of **incorrect** code for this rule:

```js
/*eslint no-await-without-trycatch: "error"*/
async function y() {
    return 123
}

y()
```

```js
/*eslint no-await-without-trycatch: "error"*/
const y = async () => {
    return 123
}

y().catch(console.error).then(x => x)
```

Examples of **correct** code for this rule:

```js
/*eslint no-await-without-trycatch: "error"*/
async function y() {
    return 123
}

y().then(x => x).catch(e => console.error(e))
```

## Recommendation

Set this rule to `error` to avoid risking `UnhandledPromiseRejectionWarning`s in the code.

## Note

This rule is experimental. For a more robust implementation for TypeScript, check out [typescript-eslint/no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-floating-promises.md).
