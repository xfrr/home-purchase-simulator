module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "src"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/"],
  transformIgnorePatterns: ["node_modules/(?!(next-intl|use-intl)/)"],
  transform: {
    "^.+\\.[jt]sx?$": ["ts-jest", { tsconfig: { allowJs: true } }],
  },
};
