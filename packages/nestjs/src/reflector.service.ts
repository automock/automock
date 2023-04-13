import { Type } from '@automock/types';
import { CustomToken, TokensReflector } from './token-reflector.service';

const INJECTED_TOKENS_METADATA = 'self:paramtypes';
const PARAM_TYPES_METADATA = 'design:paramtypes';

interface Reflector {
  reflectDependencies(targetClass: Type): ClassDependencies;
}

type ClassDependencies = Map<Type | string, Type>;

export class ReflectorService implements Reflector {
  public constructor(
    private readonly reflector: typeof Reflect,
    private readonly tokensReflector: TokensReflector
  ) {}

  public reflectDependencies(targetClass: Type): ClassDependencies {
    const types = this.reflectParamTypes(targetClass);
    const tokens = this.reflectParamTokens(targetClass);
    const classDependencies: ClassDependencies = new Map<Type | string, Type>();

    const callback = this.tokensReflector.attachTokenToDependency(tokens);

    types
      .map((typeOrUndefined, index) => {
        try {
          return callback(typeOrUndefined, index);
        } catch (error) {
          throw new Error(
            `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
          );
        }
      })
      .forEach((tuple) => {
        const [typeOrToken, type] = tuple;
        classDependencies.set(typeOrToken, type);
      });

    return classDependencies;
  }

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): (Type | undefined)[] {
    return this.reflector.getMetadata(PARAM_TYPES_METADATA, targetClass) || [];
  }
}
