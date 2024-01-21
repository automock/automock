import { MockFunction, Type } from '@suites/types';
import { AdapterNotFoundError } from '@suites/common';
import { TestBedBuilder } from './public-types';
import { AutomockAdapters, PackageResolver } from './services/package-resolver';
import { UnitMocker } from './services/unit-mocker';
import { UnitBuilder } from './services/testbed-builder';

function createTestbedBuilder<TClass>(
  mockFn: MockFunction<unknown>,
  adapters: Record<string, string>
): (targetClass: Type<TClass>) => TestBedBuilder<TClass> | never {
  try {
    const packageResolver = new PackageResolver(adapters, {
      resolve: require.resolve,
      require,
    });

    const adapter = packageResolver.resolveCorrespondingAdapter();
    const unitMocker = new UnitMocker(mockFn);

    return UnitBuilder.create<TClass>(mockFn, unitMocker, adapter, console);
  } catch (error: unknown) {
    throw new AdapterNotFoundError(`Automock requires an adapter to seamlessly integrate with different dependency injection frameworks.
It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
one of the available adapters that matches your dependency injection framework.
Refer to the docs for further information: https://suites.dev/docs`);
  }
}

export const AutomockTestBuilder = <TClass>(
  mockFn: MockFunction<unknown>
): ((targetClass: Type<TClass>) => TestBedBuilder<TClass> | never) =>
  createTestbedBuilder(mockFn, AutomockAdapters);
