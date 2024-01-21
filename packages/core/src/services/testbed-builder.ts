import { DeepPartial, Type, MockFunction, StubbedInstance } from '@suites/types';
import { AutomockErrorCode, IdentifierMetadata, ConstantValue, InjectableIdentifier } from '@suites/common';
import { UnitReference } from './unit-reference';
import { UnitMocker } from './unit-mocker';
import { MockOverride, TestBedBuilder, UnitTestBed } from '../public-types';
import { IdentifierToDependency, DependencyContainer } from './dependency-container';
import { normalizeIdentifier } from '../normalize-identifier.static';
import { omit } from 'lodash';

export class UnitBuilder {
  public static create<TClass>(
    mockFn: MockFunction<unknown>,
    unitMocker: UnitMocker
  ): (targetClass: Type<TClass>) => TestBedBuilder<TClass> {
    return (targetClass: Type<TClass>): TestBedBuilder<TClass> => {
      const identifiersToMock: IdentifierToDependency[] = [];
      const classesToExpose: Type[] = [];

      return {
        mock<TDependency>(
          identifier: InjectableIdentifier,
          metadata?: IdentifierMetadata
        ): MockOverride<TDependency, TClass> {
          return {
            using: (
              mockImplementationOrValue: DeepPartial<TDependency> | ConstantValue
            ): Omit<TestBedBuilder<TClass>, 'integrate'> => {
              if (isConstantValue(mockImplementationOrValue)) {
                identifiersToMock.push([
                  normalizeIdentifier(identifier, metadata as never),
                  mockImplementationOrValue as ConstantValue,
                ]);

                return omit<TestBedBuilder<TClass>, 'integrate'>(this, 'integrate');
              }

              identifiersToMock.push([
                normalizeIdentifier(identifier, metadata as never),
                mockFn(mockImplementationOrValue) as StubbedInstance<TDependency>,
              ]);

              return omit<TestBedBuilder<TClass>, 'integrate'>(this, 'integrate');
            },
          };
        },
        integrate(unit: Type): TestBedBuilder<TClass> {
          classesToExpose.push(unit);
          return this;
        },
        compile(): UnitTestBed<TClass> {
          const { container, instance } = unitMocker.constructUnit<TClass>(
            targetClass,
            classesToExpose,
            new DependencyContainer(identifiersToMock)
          );

          return {
            unit: instance,
            unitRef: new UnitReference(container, classesToExpose),
          };
        },
      };
    };
  }
}

function isConstantValue(value: unknown): value is ConstantValue {
  return (
    Array.isArray(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    value === null
  );
}
