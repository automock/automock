import type { Config } from '@jest/types';
import { name } from './package.json';
import base from '../../jest.config';

export default async (): Promise<Config.InitialOptions> => {
  const baseConfig = (await base(
    process.env.COVERAGE_REPORT_BASE_FILE_NAME as string
  )) as Config.InitialOptions;

  return {
    ...baseConfig,
    name,
    displayName: name,
    collectCoverageFrom: ['src/**/*.ts', 'test/**/*.ts'],
    coveragePathIgnorePatterns: ['index.ts', 'spec-assets.ts'],
  };
};
