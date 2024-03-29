import { ConstantValue, IdentifierMetadata } from '@automock/common';
import { DeepPartial, Type } from '@automock/types';
import { UnitReference } from './services/unit-reference';

/**
 * Represents the outcome when a `TestBedBuilder` is compiled.
 *
 * @template TClass The class type being tested.
 * @see https://automock.dev/api-reference/api/unittestbed-api
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class under test.
   *
   * @template TClass The class being tested.
   * @property TClass unit
   */
  unit: TClass;

  /**
   * A reference to the dependencies associated with the class under test.
   *
   * @property unitRef {UnitReference}
   */
  unitRef: UnitReference;
}

/**
 * Interface to define overrides for mocking dependencies in a test environment.
 *
 * @template TDependency The type of the dependency to be mocked.
 * @template TClass The type of the class under test.
 * @see https://automock.dev/api-reference/api/mockoverride-api
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Specifies a constant value to be used for the mocked dependency.
   *
   * @since 2.0.0
   * @param value - The constant value for the mocked dependency.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(value: TDependency & ConstantValue): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @since 2.0.0
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @returns `TestBedBuilder` instance for chaining further configuration.
   */
  using(mockImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}

/**
 * Provides methods to configure and finalize the `TestBed`.
 *
 * @template TClass The class type being tested.
 * @see https://automock.dev/api-reference/api/testbedbuilder-api
 */
export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @since 1.1.0
   * @param type The type of the dependency.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using its type along with a corresponding metadata object.
   *
   * @since 2.1.0
   * @param type The type of the dependency.
   * @param identifierMetadata the identifier metadata.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token.
   *
   * @since 1.1.0
   * @param token The token string representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a string-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
   * @param token The token string representing the dependency to be mocked.
   * @param identifierMetadata the identifier metadata.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token.
   *
   * @since 2.0.0
   * @param token - The token symbol representing the dependency to be mocked.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
   * @param token - The token symbol representing the dependency to be mocked.
   * @param identifierMetadata the identifier metadata if exists.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a symbol-based token along with a corresponding
   * metadata object.
   *
   * @since 2.1.0
   * @param identifier The identifier representing the dependency. It can be of type
   * `Type<TDependency>`, `string`, or `symbol`.
   * @param identifierMetadata the identifier metadata if exists.
   * @template TDependency The type of the dependency being mocked.
   * @returns MockOverride instance for further configuration.
   */
  mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;

  /**
   * Finalizes the mocking setup and creates a new UnitTestBed.
   *
   * @since 1.1.0
   * @returns UnitTestBed instance representing the compiled unit.
   */
  compile(): UnitTestBed<TClass>;
}
