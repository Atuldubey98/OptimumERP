module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/src/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
