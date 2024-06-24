import 'reflect-metadata';

import type { UnitReference, Mocked } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Logger } from './e2e-assets';
import {
  ClassThatIsNotInjected,
  Foo,
  NestJSTestClass,
  SymbolToken,
  SymbolTokenSecond,
  TestClassFive,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './e2e-assets';
import { expect } from 'chai';
import { before } from 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
chai.use(chaiAsPromised);

describe('Suites Sinon / NestJS E2E Test Ctor', () => {
  let unit: NestJSTestClass;
  let unitRef: UnitReference;

  before(async () => {
    const { unitRef: ref, unit: underTest } = await TestBed.solitary<NestJSTestClass>(
      NestJSTestClass
    )
      .mock(TestClassOne)
      .impl({
        foo: stub().resolves('foo-from-test'),
        bar(): string {
          return 'bar';
        },
      })
      .mock<string>('CONSTANT_VALUE')
      .impl('arbitrary-string')
      .mock('UNDEFINED')
      .impl({ method: () => 456 })
      .mock<Logger>('LOGGER')
      .impl({ log: () => 'baz-from-test' })
      .mock<TestClassFive>(SymbolToken)
      .impl({ doSomething: () => 'mocked' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    it('then the unit should an instance of the class under test', () => {
      expect(unit).to.be.instanceof(NestJSTestClass);
    });

    it('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).not.to.be.undefined;
      expect(() => unitRef.get('UNDEFINED')).not.to.be.undefined;
      expect(() => unitRef.get('UNDEFINED_SECOND')).not.to.be.undefined;
      expect(() => unitRef.get(TestClassFour)).not.to.be.undefined;
      expect(() => unitRef.get(TestClassThree)).not.to.be.undefined;
      expect(() => unitRef.get(Foo)).not.to.be.undefined;
      expect(() => unitRef.get(TestClassTwo)).not.to.be.undefined;
      expect(() => unitRef.get('CONSTANT_VALUE')).not.to.be.undefined;
      expect(() => unitRef.get(TestClassOne)).not.to.be.undefined;
      expect(() => unitRef.get(SymbolToken)).not.to.be.undefined;
      expect(() => unitRef.get(SymbolTokenSecond)).not.to.be.undefined;
    });

    it('call the unit instance method', async () => {
      const testClassTwo: Mocked<TestClassTwo> = unitRef.get(TestClassTwo);

      testClassTwo.bar.resolves('context');

      const result = await unit.test();
      expect(result).to.equal('context-baz-from-test-bar');
    });

    it('then do not return the actual reflected dependencies of the injectable class', () => {
      expect(() => unitRef.get(TestClassOne)).not.to.be.instanceof(TestClassOne);
      expect(() => unitRef.get(TestClassTwo)).not.to.be.instanceof(TestClassTwo);
      expect(() => unitRef.get(SymbolToken)).not.to.be.instanceof(TestClassFive);
    });

    it('then mock the implementation of the dependencies', async () => {
      const testClassOne: Mocked<TestClassOne> = unitRef.get(TestClassOne);
      testClassOne.foo.withArgs(true).resolves('foo-from-test');

      await expect(testClassOne.foo(true)).to.eventually.equal('foo-from-test');
      await expect(testClassOne.foo(false)).to.eventually.equal('foo-from-test');
    });

    it('then mock the undefined reflected values and tokens', () => {
      const testClassFour: Mocked<TestClassFour> = unitRef.get(TestClassFour);
      const undefinedValue: Mocked<{ method: () => number }> = unitRef.get<{
        method: () => number;
      }>('UNDEFINED');

      testClassFour.doSomething.returns('mocked');

      expect(testClassFour.doSomething()).to.equal('mocked');
      expect(undefinedValue.method()).to.equal(456);
    });

    it('then throw an error when trying to resolve not existing dependency', () => {
      expect(() => unitRef.get(ClassThatIsNotInjected)).to.throw;
    });
  });
});
