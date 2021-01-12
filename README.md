# Type-safe practices for TypeScript

TypeScript offers a power static typing system that can help developers to avoid painful bugs. However, there are some limitations.

For example, there is no way to force error handling:

```ts
function f(): never {
    throw new Error()
}

f() // No type error
```

More confusingly, the following functions have the same type signature:

```ts
function f(x: number): number {
    return x
}

function g(x: number): number {
    return Math.random() > 0.5 ? x : throw new Error()
}
```

Given a codebase of sufficient complexity, an unexpected error state will eventually occur that could bubble up to the entry point of the application.

Although intended for TypeScript, this package is also interoperable with JavaScript codebases.

## Getting started

```bash
npm install save-dev eslint-plugin-typesafe
```

And configure your `.eslintrc` file accordingly. For example:

```bash
{
    "plugins": [
        "typesafe",
    ],
    "rules": {
        "typesafe/no-throw-sync-func": "error",
    }
}
```

## Rules

The current rule(s) are:

* [no-throw-sync-func](./docs/rules/no-throw-sync-func.md)
* [no-await-without-trycatch](./docs/rules/no-await-without-trycatch.md)

Some suggested rules in the pipeline:

* no-promise-without-catch

If you feel anything is missing or would like to see additional rules added, feel free to write an [issue](https://github.com/liangyuanruo/eslint-plugin-typesafe/issues).
