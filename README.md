# Type-safe practices for TypeScript

TypeScript offers a power static typing system that can help developers to avoid painful bugs. However, there are some limitations.

For example, there is no way to force error handling:

```ts
function f(): never {
    throw new Error()
}

f() // No type error
```

Mre confusingly, the following functions have the same type signature:

```ts
function f(x: number): number {
    return x
}

function g(x: number): number {
    return Math.random() > 0.5 ? x : throw new Erorr()
}
```

Given a codebase of sufficient complexity, eventually an unexpected error state will occur that could bubble up to the entry point of the application, causing a crash.

## Usage

These rules can be used by downloading the [Config](https://github.com/LewisArdern/eslint-config-angular-security) which includes the installation settings.

## Rules

The current rule(s) are:

* [no-throw-sync-func](./docs/rules/no-throw-sync-func.md)

If you feel anything is missing or would like to see additional rules added, feel free to write an [issue](https://github.com/liangyuanruo/eslint-plugin-typesafe/issues).
