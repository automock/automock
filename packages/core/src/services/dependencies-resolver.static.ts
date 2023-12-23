import { MockFunction, StubbedInstance, Type } from '@automock/types';
import { DependencyContainer, IdentifierToDependency } from './dependency-container';
import {
  AutomockDependenciesAdapter,
  ConstantValue,
  IdentifierMetadata,
  InjectableIdentifier,
  WithMetadata,
} from '@automock/common';

export function DependencyResolver(
  classesToExpose: Type[],
  mockedFromBeforeContainer: DependencyContainer,
  adapter: AutomockDependenciesAdapter,
  mockFunction: MockFunction<unknown>
) {
  const resolvedDependencies = new Map<
    InjectableIdentifier,
    Type | StubbedInstance<unknown> | ConstantValue
  >();

  const isLeafOrPrimitive = (identifier: InjectableIdentifier): boolean => {
    return (
      typeof identifier !== 'function' || adapter.inspect(identifier as Type).list().length === 0
    );
  };

  const resolveOrMock = (identifier: InjectableIdentifier, metadata?: IdentifierMetadata): any => {
    if (resolvedDependencies.has(identifier)) {
      return resolvedDependencies.get(identifier);
    }

    const existingMock = mockedFromBeforeContainer.resolve(identifier, metadata);

    if (existingMock !== undefined) {
      resolvedDependencies.set(identifier, existingMock);
      return existingMock;
    }

    if (isLeafOrPrimitive(identifier)) {
      if (typeof identifier === 'function' && classesToExpose.includes(identifier)) {
        instantiateClass(identifier);
      }

      const mock = mockFunction();
      resolvedDependencies.set(identifier, mock);
      return mock;
    }

    // Non-leaf classes that are not exposed should also be mocked
    if (typeof identifier === 'function' && !classesToExpose.includes(identifier)) {
      const mock = mockFunction();
      resolvedDependencies.set(identifier, mock);
      return mock;
    }

    // Instantiate class if it's not a leaf or primitive
    return instantiateClass(identifier as Type);
  };

  const instantiateClass = (type: Type): any => {
    if (resolvedDependencies.has(type)) {
      return resolvedDependencies.get(type);
    }

    const injectableRegistry = adapter.inspect(type);
    const ctorInjectables = injectableRegistry.list().filter(({ type }) => type === 'PARAM');

    const ctorParams = ctorInjectables.map(({ identifier, metadata }: WithMetadata<never>) => {
      if (resolvedDependencies.has(identifier)) {
        return resolvedDependencies.get(identifier);
      }

      return resolveOrMock(identifier, metadata);
    });

    const instance = new type(...ctorParams);
    resolvedDependencies.set(type, instance);

    const propsInjectables = injectableRegistry.list().filter(({ type }) => type === 'PROPERTY');

    propsInjectables.forEach(({ identifier, metadata, property }: WithMetadata<never>) => {
      const propValue = resolveOrMock(identifier, metadata);
      instance[property!.key] = propValue;

      resolvedDependencies.set(identifier, propValue);
    });

    return instance;
  };

  return { instantiateClass, resolveOrMock, resolvedDependencies };
}
