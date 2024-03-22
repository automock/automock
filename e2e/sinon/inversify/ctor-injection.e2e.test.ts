import 'reflect-metadata';

import { UnitReference, TestBed, Mocked } from '@suites/unit';
import {
  ClassThatIsNotInjected,
  Foo,
  Logger,
  InversifyJSTestClass,
  SymbolToken,
  SymbolTokenSecond,
  TestClassFive,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
  Bar,
} from './e2e-assets';
import { expect } from 'chai';
import { before } from 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
chai.use(chaiAsPromised);

describe('Suites Jest / InversifyJS E2E Test Ctor', () => {
  let unit: InversifyJSTestClass;
  let unitRef: UnitReference;

  before(() => {
    const { unitRef: ref, unit: underTest } = TestBed.create<InversifyJSTestClass>(
      InversifyJSTestClass
    )
      .mock(TestClassOne)
      .using({
        foo: stub().resolves('foo-from-test'),
        bar(): string {
          return 'bar';
        },
      })
      .mock<Logger>('LOGGER')
      .using({ log: () => 'baz-from-test' })
      .mock('UNDEFINED')
      .using({ method: () => 456 })
      .mock<Bar>('BarToken', { name: 'someTarget' })
      .using({})
      .mock<string>('CONSTANT_VALUE')
      .using('arbitrary-string')
      .mock<TestClassFive>(SymbolToken)
      .using({ doSomething: () => 'mocked' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    it('then the unit should an instance of the class under test', () => {
      expect(unit).to.be.instanceof(InversifyJSTestClass);
    });

    it('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).not.to.be.undefined;
      expect(() => unitRef.get('UNDEFINED')).not.to.be.undefined;
      expect(() => unitRef.get('UNDEFINED_SECOND')).not.to.be.undefined;
      expect(() => unitRef.get(TestClassFour, { canThrow: true })).not.to.be.undefined;
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
      const logger = unitRef.get<Logger>('LOGGER');

      // The original 'foo' method in TestClassOne return value should be changed
      // according to the passed flag; here, always return the same value
      // because we mock the implementation of foo permanently
      await expect(testClassOne.foo(true)).to.eventually.equal('foo-from-test');
      await expect(testClassOne.foo(false)).to.eventually.equal('foo-from-test');

      expect(logger.log).not.to.be.undefined;
    });

    it('then treat duplicate identifiers as the same reference', async () => {
      await expect(unit.testDuplicateIdentifier()).to.eventually.equal(
        'foo-from-test<>foo-from-test'
      );
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
