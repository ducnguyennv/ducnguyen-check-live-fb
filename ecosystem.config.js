module.exports = {
  apps : [{
    name: 'fb-checker-bot',
    script: 'index.js',
    watch: true,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    time: true
  }]
}; 