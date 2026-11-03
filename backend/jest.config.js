module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/../tests/backend"],
  testMatch: ["**/*.test.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        target: "ES2022",
        module: "commonjs",
        moduleResolution: "node",
        esModuleInterop: true,
        skipLibCheck: true,
        baseUrl: ".",
        paths: {
          "*": ["node_modules/*", "./node_modules/*"]
        }
      }
    }]
  },
  verbose: true,
  testTimeout: 60000
};
