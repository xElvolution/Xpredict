module.exports = {
  apps: [
    {
      name: 'xpredict-curator',
      script: 'npx',
      args: 'tsx agents/curator.ts',
      cwd: '/home/xpredict/Xpredict',
      cron_restart: '0,30 * * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
      out_file: '/var/log/xpredict/curator.log',
      error_file: '/var/log/xpredict/curator.err.log'
    },
    {
      name: 'xpredict-resolver',
      script: 'npx',
      args: 'tsx agents/resolver.ts',
      cwd: '/home/xpredict/Xpredict',
      cron_restart: '*/15 * * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
      out_file: '/var/log/xpredict/resolver.log',
      error_file: '/var/log/xpredict/resolver.err.log'
    }
  ]
};
