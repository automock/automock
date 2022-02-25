[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/@automock/jest.svg?style=flat)](https://npmjs.org/package/automock "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/automock/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/automock)
[![ci](https://github.com/omermorad/automock/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/automock/actions)

<p align="center">
  <br/>
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />

  <h1 align="center">AutoMock (Jest)</h1>

  <h3 align="center">
    Standalone Library for Dependencies Auto Mocking (for TypeScript)
  </h3>

  <h3 align="center">
    Works with any testing framework!
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>
</p>

## Installation

💡 Install `jest-mock-extended` as a peer dependency

With NPM:
```bash
npm i -D @automock/jest
```

Or with Yarn:
```bash
yarn add -D @automock/jest
```

## Who can use this library? 🤩
**TL;DR**

If you are using this pattern in your framework (it doesn't matter which one):

```typescript
export class AwesomeClass {
  public constructor(private readonly dependecy1: SomeOtherClass) {}
}
```

You can use Jest Unit :)

### Tell me more 🤔
If you are using any TypeScript framework: Angular, React+TypeScript, NestJS, TypeDI, TsED
or even if you are framework free, jest unit is for you.

Jest Unit is framework agnostic, so it's basically serves everyone! if you
are using any implementation of dependency inversion (dependency injection on most cases)
this library is for you.

The only assumption/requirement is that you are taking your class dependencies via
the class constructor (like in the example above).

## What is this library❓

This package helps isolate the dependencies of any given class, by using a simple
reflection mechanism on the class constructor params metadata. When used in conjunction with
`jest-mock-extended` library, all the class dependencies (constructor params) will be overridden
automatically and become mocks (or deep mocks if you want it to).

## Example and Usage 💁‍

```typescript
import { DeepMockOf, MockOf, Spec } from 'automock';

describe('SomeService Unit Test', () => {
  let someService: SomeService;
  let logger: MockOf<Logger>;
  let userService: MockOf<UserService>;

  const USERS_DATA = [{ name: 'user', email: 'user@user.com' }];

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit<SomeService>(SomeService)
      .mock(FeatureFlagService)
      .using({
        isFeatureOn: () => Promise.resolve(true),
      })
      // All the rest of the dependencies will be mocked
      // Pass true if you want to deep mock all of the rest
      .compile();

    someService = unit;
    userService = unitRef.get(UserService);
  });

  describe('When something happens', () => {
    beforeAll(() => (userService.getUsers.mockResolvedValueOnce(USERS_DATA));
    
    test('then check something', async () => {
      const result = await service.doSomethingNice();

      expect(logger.log).toHaveBeenCalledWith(USERS_DATA);
      expect(result).toEqual(USERS_DATA);
    });
  });
});
```

<details><summary><code>📄 Show me the source</code></summary><p>

```typescript
@Reflectable()
export class SomeService {
  public constructor(
    private readonly logger: Logger,
    private readonly catsService: CatsService,
    private readonly userService: UserService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}
  
  public async doSomethingNice() {
    if (this.featureFlagService.isFeatureOn()) {
      const users = await this.userService.getUsers('https://example.com/json.json');
      this.logger.log(users);

      return users;
    }
    
    return null;
  }
}
```
</p></details>

<hr />

<details>
    <summary>What is this <code>@Reflectable()</code> decorator?</summary>
    <p>
In order to reflect the constructor class params it needs to be decorated with any
class decorator, no matter what its original functionality.
If you are not using any kind of decorator, you can just use the default decorator that
does, literally, nothing; his purpose is to emit class metadata; so no w

But, for example, if you do use `@Injecatable()` (NestJS or Angular), `@Service()` (TypeDI),
`@Component()` or any kind of decorator, you don't need to decorate your class with
the `@Reflectable()` decorator.

</p>
</details>

**Still need further example? [Jump to full sample](https://github.com/omermorad/automock/tree/master/sample) 📄**


## Motivation 💪

Unit tests exercise very small parts of the application **in complete isolation**. \
**"Complete isolation" means that, when unit testing, you don’t typically
connect your application with external dependencies such as databases, the filesystem,
or HTTP services**. That allows unit tests to be fast and more stable since they won’t
fail due to problems with those external services. (Thank you, Testim.io - [jump to source](https://www.testim.io/blog/unit-testing-best-practices/))

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements 📙

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
