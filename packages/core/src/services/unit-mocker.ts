import { MockFunction } from '@suites/types.doubles';
import { InjectableRegistry, WithMetadata } from '@suites/types.di';
import { IdentifierToMock, MocksContainer } from './mocks-container';
import { normalizeIdentifier } from '../normalize-identifier.static';
import { Type } from '@suites/types.common';

export interface MockedUnit<TClass> {
  container: MocksContainer;
  instance: TClass;
}

export class UnitMocker {
  public constructor(private readonly mockFunction: Promise<MockFunction<unknown>>) {}

  public async applyMocksToUnit<TClass>(
    targetClass: Type<TClass>
  ): Promise<
    (mockContainer: MocksContainer, injectablesContainer: InjectableRegistry) => MockedUnit<TClass>
  > {
    const identifiersToMocks: IdentifierToMock[] = [];
    const mockFunction = await this.mockFunction;

    return (
      mocksContainer: MocksContainer,
      injectablesContainer: InjectableRegistry
    ): MockedUnit<TClass> => {
      const allInjectables = injectablesContainer.list() as WithMetadata<never>[];
      const ctorInjectables = allInjectables.filter(({ type }) => type === 'PARAM');
      const propsInjectables = allInjectables.filter(({ type }) => type === 'PROPERTY');

      for (const { identifier, metadata } of ctorInjectables) {
        const mock = mocksContainer.resolve(identifier, metadata) || mockFunction();
        identifiersToMocks.push([normalizeIdentifier(identifier, metadata), mock]);
      }

      const classCtorParams = identifiersToMocks.map(([, value]) => value);
      const classInstance = new targetClass(...classCtorParams) as Record<string, unknown>;

      for (const { identifier, metadata, property } of propsInjectables) {
        const mock = mocksContainer.resolve(identifier, metadata) || mockFunction();

        identifiersToMocks.push([normalizeIdentifier(identifier, metadata), mock]);
        classInstance[property!.key] = mock;
      }

      return {
        container: new MocksContainer(identifiersToMocks),
        instance: classInstance as TClass,
      };
    };
  }
}
