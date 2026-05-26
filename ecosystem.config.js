module.exports = {
  apps: [
    {
      name: "vriksh-sf",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "D:\\VrikshSF",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
    },
  ],
}
