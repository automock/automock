import isEqual from 'lodash.isequal';
import type { ClassInjectable, IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { StubbedInstance } from '@suites/types.doubles';
import type { ConstantValue } from '@suites/types.common';

export type IdentifierToDependency = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  StubbedInstance<unknown> | ConstantValue,
];

export interface DependencyContainer {
  resolve<TDependency = unknown>(
    identifier: InjectableIdentifier<TDependency>,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue;
}

export class DependencyContainer {
  public constructor(private readonly identifierToDependency: IdentifierToDependency[]) {}

  public resolve<TDependency = unknown>(
    identifier: InjectableIdentifier<TDependency>,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue | undefined {
    // If there is one identifier, it is enough to match, no need to check metadata
    const identifiers = this.identifierToDependency.filter(
      ([{ identifier: injectableIdentifier }]) => injectableIdentifier === identifier
    );

    if (identifiers.length === 0) {
      return undefined;
    }

    if (identifiers.length === 1 && !metadata) {
      return identifiers[0][1] as StubbedInstance<TDependency> | ConstantValue;
    }

    // If there are more than one injectable with the same identifier, we need to check the metadata as well
    if (metadata) {
      const identifierToMock = identifiers.find(([{ metadata: injectableMetadata }]) =>
        isEqual(injectableMetadata, metadata)
      );

      return identifierToMock
        ? (identifierToMock[1] as StubbedInstance<TDependency> | ConstantValue)
        : undefined;
    }

    const foundIdentifier = this.identifierToDependency.find(
      ([{ identifier: injectableIdentifier, metadata }]) =>
        injectableIdentifier === identifier && typeof metadata === 'undefined'
    );

    return foundIdentifier
      ? (foundIdentifier[1] as StubbedInstance<TDependency> | ConstantValue)
      : undefined;
  }

  public list(): IdentifierToDependency[] {
    return this.identifierToDependency;
  }
}