export default {
  projects: [
    {
      displayName: 'Unit test',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'src',
      testRegex: '\\.spec\\.ts$',
    },
    {
      displayName: 'E2E test',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'test',
      testRegex: '\\.e2e-spec\\.ts$',
    },
  ],
};
