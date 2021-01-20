# Type-safe practices for TypeScript and JavaScript

## Getting started

```bash
npm install --save-dev eslint-plugin-typesafe
```

And configure your `.eslintrc` file accordingly. For example:

```bash
{
    "plugins": [
        "typesafe",
    ],
    "rules": {
        "typesafe/no-throw-sync-func": "error",
        "typesafe/no-await-without-trycatch": "warn",
    }
}
```

## Motivation

TypeScript offers a power static typing system that can help developers to avoid painful bugs, especially in sizeable projects.

However, some limitations remain as TypeScript is committed to being a superset of the JavaScript language.

This plugin aims to implement additional rules that can help improve type safety, but are not available as standard ESLint rules.

For example, following functions have the same type signature:

```ts
function f(x: number): number {
    return x
}

function g(x: number): number {
    return Math.random() > 0.5 ? x : throw new Error()
}
```

There is also no way to force error handling:

```ts
function f(): never {
    throw new Error()
}

f() // No type error
```

Given a codebase of sufficient complexity, an unexpected error state will eventually occur that could bubble up to the entry point of the application.

## Achieving maximal type safety

Instead of merely using TypeScript, consider encoding failures in your program with a library such as [neverthrow](https://www.npmjs.com/package/neverthrow), or adopting functional programming with [fp-ts](https://www.npmjs.com/package/fp-ts).

## Existing rules

The current rule(s) are:

* [no-throw-sync-func](https://github.com/liangyuanruo/eslint-plugin-typesafe/blob/master/docs/rules/no-throw-sync-func.md)
* [no-await-without-trycatch](https://github.com/liangyuanruo/eslint-plugin-typesafe/blob/master/docs/rules/no-await-without-trycatch.md)
* [promise-catch](https://github.com/liangyuanruo/eslint-plugin-typesafe/blob/master/docs/rules/promise-catch.md) (beta)

## Future work

Integrate with [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) so that TypeScript syntax can be explicitly supported.
