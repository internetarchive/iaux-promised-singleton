[![Build Status](https://travis-ci.com/internetarchive/iaux-promised-singleton.svg?branch=master)](https://travis-ci.com/internetarchive/iaux-promised-singleton) [![codecov](https://codecov.io/gh/internetarchive/iaux-promised-singleton/branch/master/graph/badge.svg)](https://codecov.io/gh/internetarchive/iaux-promised-singleton)

# PromisedSingleton

A generic Typescript class for lazy-loading singletons.

`PromisedSingleton` is a generic wrapper for an asynchronously generated object that you only
want one instance of (a singleton).

### Background

We often want to generate a single instance of an object, but when that instance is
asynchronously generated, you may have many consumers requesting that instance
at the same time. The Promises don't automatically chain so you have to do some
gatekeeping to make sure only one instance gets created.

`PromisedSingleton` ensures that no matter how many callers request the object,
only one instance gets created.

It gets initialized with a generator `Promise` that generates the singleton.
When `get()` is first called, it executes the Promise, caches its results and
returns it to the caller.

If more callers call it in the interim, it chains the promises and when the singleton
is created, it resolves them all.

## Installation
```bash
npm i @internetarchive/promised-singleton
```

## Usage
```ts
// foo-service-provider.ts
import { PromisedSingleton } from '@internetarchive/promised-singleton';

export class FooServiceProvider {

  // Use the PromisedSingleton object with the type of object you will be returning
  fooService: PromisedSingleton<FooService>;

  constructor() {
    // Configure the PromisedSingleton with a `generator` Promise that knows how to generate
    // the singleton
    this.service = new PromisedSingleton<FooService>({
      generator: new Promise(resolve => {
        const service = new FooService();
        service.setup().then(service => resolve(service))
      })
    });
  }
}

// consumer.ts
import { FooServiceProvider } from './foo-service-provider';

export class Consumer1 {
  // Passing the same FooServiceProvider into the consumers
  constructor(serviceProvider: FooServiceProvider) {
    this.serviceProvider = serviceProvider
  }

  async setup() {
    // Call `.get()` on the property to fetch an instance of `FooService`
    // Many consumers can call `get()` and they will all receive the same instance
    try {
      const service = await this.serviceProvider.fooService.get();
    } catch (error) {
      console.error('error fetching service singleton', error);
    }
    const result = await service.fetchFoos();
  }
}
```

## Linting with ESLint, Prettier, and Types
To scan the project for linting errors, run
```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well
```bash
npm run lint:eslint
```
```bash
npm run lint:prettier
```

To automatically fix many linting errors, run
```bash
npm run format
```

You can format using ESLint and Prettier individually as well
```bash
npm run format:eslint
```
```bash
npm run format:prettier
```

## Testing with Karma
To run the suite of karma tests, run
```bash
npm run test
```

To run the tests in watch mode (for <abbr title="test driven development">TDD</abbr>, for example), run

```bash
npm run test:watch
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
