// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["js", "mjs", "cjs", "json"],
  testMatch: ["**/?(*.)+(test|spec).js"],
};
