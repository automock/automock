import type { Type } from '@suites/types.common';
import { SuitesError, SuitesErrorCode } from '@suites/types.common';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { MockFunction } from '@suites/types.doubles';
import { SolitaryTestBedBuilder, SociableTestBedBuilder, UnitMocker } from '@suites/core.unit';
import { PackageResolver } from './package-resolver';
import * as console from 'console';
import type { TestBedBuilder } from './types';

export class AdapterNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}

const SuitesDoublesAdapters = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
  bun: '@suites/doubles.bun',
  deno: '@suites/doubles.deno',
  node: '@suites/doubles.node',
} as const;

const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
  tsyringe: '@suites/di.tsyringe',
} as const;

function testBedBuilderFactory<TClass>(
  diAdapters: typeof SuitesDIAdapters,
  doublesAdapters: typeof SuitesDoublesAdapters,
  targetClass: Type<TClass>
): { create: <TBuilder>(type: Type<TestBedBuilder<TClass>>) => TBuilder } {
  return {
    create: <TBuilder>(type: Type<TestBedBuilder<TClass>>): TBuilder => {
      const diPackageResolver = new PackageResolver<DependencyInjectionAdapter>(diAdapters);

      const diAdapter = diPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`It seems that there is an issue with the adapter package needed to integrate Suites
with your dependency injection framework. To resolve this issue, please install the
correct Suites adapter package that is compatible with your dependency injection framework.
For more details, refer to our docs website: https://suites.dev/docs`);
        });

      const doublesPackageResolver = new PackageResolver<MockFunction<unknown>>(doublesAdapters);

      const doublesAdapter = doublesPackageResolver
        .resolveCorrespondingAdapter()
        .then((adapter) => adapter)
        .catch(() => {
          throw new AdapterNotFoundError(`It seems that there is an issue with the adapter package needed to integrate Suites
with your mocking library. To resolve this issue, please install the
correct Suites adapter package that is compatible with mocking library.
For more details, refer to our docs website: https://suites.dev/docs`);
        });

      const unitMocker = new UnitMocker(doublesAdapter, diAdapter);

      return new type(doublesAdapter, diAdapter, unitMocker, targetClass, console) as TBuilder;
    },
  };
}

export class TestBed {
  public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SolitaryTestBedBuilder
    );
  }

  public static sociable<TClass = any>(targetClass: Type<TClass>): SociableTestBedBuilder<TClass> {
    return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
      SociableTestBedBuilder
    );
  }
}
