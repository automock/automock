import { Type } from '@nestjs/common/interfaces';
import { DeepMockOf, MockOf } from './types';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<Type, DeepMockOf<unknown>>) {}

  public get<TClass>(type: Type<TClass>): MockOf<TClass>;
  public get<TClass>(type: Type<TClass>): DeepMockOf<TClass>;

  public get<TClass>(type: Type<TClass>): DeepMockOf<TClass> | MockOf<TClass> {
    return this.depNamesToMocks.get(type) as DeepMockOf<TClass> | MockOf<TClass>;
  }
}
