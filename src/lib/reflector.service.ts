import { Type } from './types';

export interface CustomToken {
  index: number;
  param: string;
}

export class ReflectorService {
  private static readonly INJECTED_TOKENS_METADATA = 'self:paramtypes';
  private static readonly PARAM_TYPES_METADATA = 'design:paramtypes';

  public constructor(private readonly reflector: typeof Reflect) {}

  public reflectDependencies(targetClass: Type): Map<string | Type<unknown>, Type<unknown>> {
    const classDependencies = new Map<string | Type<unknown>, Type<unknown>>();

    const types = this.reflectParamTypes(targetClass);
    const tokens = this.reflectParamTokens(targetClass);

    const duplicates = ReflectorService.findDuplicates([...types]).map((typeOrToken) =>
      typeof typeOrToken === 'string' ? typeOrToken : typeOrToken.name
    );

    types.map((type: Type<unknown>, index: number) => {
      if (duplicates.includes(type.name)) {
        const token = ReflectorService.findToken(tokens, index);

        if (!token) {
          if (type.name === 'Object') {
            throw new Error(
              `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
            );
          } else {
            throw new Error(`'${targetClass.name}' includes non-unique types/tokens dependencies`);
          }
        }

        classDependencies.set(token as any, type);
      } else {
        classDependencies.set(type, type);
      }
    });

    return classDependencies;
  }

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(ReflectorService.INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): Type<unknown>[] {
    return this.reflector.getMetadata(ReflectorService.PARAM_TYPES_METADATA, targetClass) || [];
  }

  private static findToken(list: CustomToken[], index: number): string | boolean {
    const record = list.find((element) => element.index === index);
    return record?.param ?? false;
  }

  private static findDuplicates(typesOrToken: (Type | string)[]) {
    const items = [...typesOrToken.sort()];

    let index = items.length;
    const duplicates = [];

    while (index--) {
      items[index] === items[index - 1] &&
        duplicates.indexOf(items[index]) == -1 &&
        duplicates.push(items[index]);
    }

    return duplicates;
  }
}
