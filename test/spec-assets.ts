import 'reflect-metadata';
import { Inject, Injectable } from '@nestjs/common';
import { Reflectable } from '../src';

@Reflectable()
export class TestClassOne {
  async foo(flag: boolean): Promise<string> {
    if (flag) {
      return Promise.resolve('foo-with-flag');
    }

    return Promise.resolve('foo');
  }
}

@Reflectable()
export class TestClassTwo {
  async bar(): Promise<string> {
    return Promise.resolve('bar');
  }
}

@Reflectable()
export class TestClassThree {
  baz(): string {
    return 'baz';
  }
}

export interface Logger {
  log(): any;
}

@Reflectable()
export class MainTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    @Inject('LOGGER') private readonly logger: Logger
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value}-${value2}-${value3}`;
  }
}

@Injectable()
export class NestJSTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    @Inject('LOGGER') private readonly logger: Logger
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value}-${value2}-${value3}`;
  }
}
