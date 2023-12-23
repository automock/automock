import { Type, MockFunction } from '@automock/types';
import { AutomockDependenciesAdapter, WithMetadata } from '@automock/common';
import { IdentifierToDependency, DependencyContainer } from './dependency-container';
import { DependencyResolver } from './dependencies-resolver.static';

export interface MockedUnit<TClass> {
  container: DependencyContainer;
  instance: TClass;
}

export class UnitMocker {
  public constructor(
    private readonly mockFunction: MockFunction<unknown>,
    private readonly logger: Console,
    private readonly adapter: AutomockDependenciesAdapter
  ) {}

  public constructUnit<TClass>(
    targetClass: Type<TClass>,
    classesToExpose: Type[],
    mockContainer: DependencyContainer
  ): MockedUnit<TClass> {
    const dependencyResolver = DependencyResolver(
      classesToExpose,
      mockContainer,
      this.adapter,
      this.mockFunction
    );

    const instance = dependencyResolver.instantiateClass(targetClass);

    const identifierToDependency = Array.from(dependencyResolver.resolvedDependencies.entries())
      .map(([identifier, value]) => [{ identifier }, value] as IdentifierToDependency)
      .filter(([{ identifier }]) => identifier !== targetClass);

    return {
      container: new DependencyContainer(identifierToDependency),
      instance: instance as TClass,
    };
  }
}
