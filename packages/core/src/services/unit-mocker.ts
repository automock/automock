import type { MockFunction } from '@suites/types.doubles';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { IdentifierToDependency } from './dependency-container';
import { DependencyContainer } from './dependency-container';
import type { Type } from '@suites/types.common';
import { DependencyResolver } from './dependency-resolver';

export interface MockedUnit<TClass> {
  container: DependencyContainer;
  instance: TClass;
  redundant: {
    mocks: { metadata?: unknown; identifier: Type }[];
    exposed: Type[];
  };
}

export class UnitMocker {
  public constructor(
    private readonly mockFunction: Promise<MockFunction<unknown>>,
    private readonly diAdapter: Promise<DependencyInjectionAdapter>
  ) {}

  public async constructUnit<TClass>(
    targetClass: Type<TClass>,
    classesToExpose: Type[],
    mockContainer: DependencyContainer
  ): Promise<MockedUnit<TClass>> {
    const dependencyResolver = new DependencyResolver(
      classesToExpose,
      mockContainer,
      await this.diAdapter,
      await this.mockFunction
    );

    const instance = dependencyResolver.instantiateClass(targetClass);

    const identifierToDependency = Array.from(dependencyResolver.getResolvedDependencies())
      .map(([identifier, value]) => [identifier, value] as IdentifierToDependency)
      .filter(([{ identifier }]) => identifier !== targetClass);

    return {
      container: new DependencyContainer(identifierToDependency),
      instance: instance as TClass,
      redundant: dependencyResolver.getRedundantInteractions(),
    };
  }
}
