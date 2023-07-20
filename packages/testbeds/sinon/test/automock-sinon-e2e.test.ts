import { SinonStubbedInstance } from 'sinon';
import { TestBedBuilder } from '@automock/core';
import {
  Logger,
  MainTestClass,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './spec-assets-nestjs';
import { TestBed, UnitTestBed } from '../src';
import sinon from 'sinon';

describe('AutoMock E2E Test', () => {
  let unit: UnitTestBed<MainTestClass>;
  let unitBuilder: TestBedBuilder<MainTestClass>;

  describe('given a unit testing builder with two overrides', () => {
    beforeAll(() => {
      unitBuilder = TestBed.create<MainTestClass>(MainTestClass)
        .mock(TestClassOne)
        .using({
          foo: (): Promise<string> => Promise.resolve('foo-from-test'),
        })
        .mock<string>('PRIVATE_VALUE')
        .using('arbitrary-string')
        .mock<Logger>('LOGGER')
        .using({ log: () => 'baz-from-test' });
    });

    describe('when compiling the builder and turning into testing unit', () => {
      beforeAll(() => (unit = unitBuilder.compile()));

      test('then return an actual instance of the injectable class', () => {
        expect(unit).toHaveProperty('unit');
        expect(unit.unit).toBeInstanceOf(MainTestClass);
      });

      test('then successfully resolve the dependencies of the tested classes', () => {
        const { unitRef } = unit;

        expect(unitRef.get(TestClassOne)).toBeDefined();
        expect(unitRef.get(TestClassTwo)).toBeDefined();
        expect(unitRef.get('LOGGER')).toBeDefined();
      });

      test('then do not return the actual reflected dependencies of the injectable class', () => {
        // Indeed, they all need to be overwritten
        const { unitRef } = unit;

        expect(unitRef.get(TestClassOne)).not.toBeInstanceOf(TestClassOne);
        expect(unitRef.get(TestClassTwo)).not.toBeInstanceOf(TestClassTwo);
      });

      test('then throw an error when trying to resolve not existing dependecy', () => {
        const { unitRef } = unit;
        expect(() => unitRef.get(TestClassThree)).toThrow();
      });

      test('then hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
        const { unitRef } = unit;
        const testClassOne = unitRef.get(TestClassOne);

        // The original 'foo' method in TestClassOne return value should be changed
        // according to the passed flag; here, always return the same value
        // because we mock the implementation of foo permanently
        await expect(testClassOne.foo(true)).resolves.toBe('foo-from-test');
        await expect(testClassOne.foo(false)).resolves.toBe('foo-from-test');
      });

      test('then all the un-override classes/dependencies should be stubs', () => {
        const { unitRef } = unit;
        const testClassTwo: SinonStubbedInstance<TestClassTwo> = unitRef.get(TestClassTwo);

        expect(testClassTwo.bar).toBeDefined();
        expect(testClassTwo.bar).toEqual(sinon.stub);
      });
    });
  });
});
