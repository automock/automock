import isEqual from 'lodash.isequal';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  IdentifierMetadata,
  InjectablesRegistry,
  WithMetadata,
} from '@automock/common';
import { Type } from '@automock/types';
import { normalizeIdentifier } from '../../src/normalize-identifier.static';
import {
  apiServiceRegistry,
  databaseServiceRegistry,
  userApiServiceRegistry,
  userDalRegistry,
  userDigestServiceRegistry,
  userServiceRegistry,
  emptyRegistry,
  HttpClient,
  Logger,
  UserVerificationService,
  ApiService,
  DatabaseService,
  UserDigestService,
  UserApiService,
  UserDal,
  UserService,
} from '../injectables-registry.fixture';

const registryToClass: Map<Type, InjectablesRegistry> = new Map([
  [HttpClient, emptyRegistry],
  [Logger, emptyRegistry],
  [UserVerificationService, emptyRegistry],
]);

registryToClass.set(ApiService, apiServiceRegistry);
registryToClass.set(DatabaseService, databaseServiceRegistry);
registryToClass.set(UserDigestService, userDigestServiceRegistry);
registryToClass.set(UserApiService, userApiServiceRegistry);
registryToClass.set(UserDal, userDalRegistry);
registryToClass.set(UserService, userServiceRegistry);

export const FakeAdapter: AutomockDependenciesAdapter = {
  inspect: (targetClass: Type) => {
    return {
      list: () => {
        return registryToClass.get(targetClass)!.list();
      },
      resolve(
        identifier: Type | string,
        metadata?: IdentifierMetadata
      ): ClassInjectable | undefined {
        return registryToClass
          .get(targetClass)!
          .list()
          .find((injectable: WithMetadata<never>) => {
            const subject = normalizeIdentifier(identifier, metadata as never);
            const toFind = normalizeIdentifier(injectable.identifier, injectable.metadata);

            return isEqual(toFind, subject);
          });
      },
    };
  },
};
