module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/src/server.js",
      node_args : '-r ./backend/node_modules/dotenv/config'
    },
  ],
};
