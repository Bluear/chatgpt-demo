module.exports = {
    apps: [
      {
        name: 'ai',
        script: 'npm',
        args: 'run start',
        autorestart: true,
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };