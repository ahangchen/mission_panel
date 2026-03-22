module.exports = {
  apps: [
    {
      name: 'mission-panel-backend',
      cwd: '/home/cwh/coding/mission_panel/backend',
      script: '/home/cwh/miniconda3/envs/mission_panel/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      env: {
        PATH: '/home/cwh/miniconda3/envs/mission_panel/bin',
        PYTHONPATH: '/home/cwh/coding/mission_panel/backend'
      },
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: '/tmp/mission-panel-backend-error.log',
      out_file: '/tmp/mission-panel-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'mission-panel-frontend',
      cwd: '/home/cwh/coding/mission_panel',
      script: 'start-frontend.sh',
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production'
      },
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: '/tmp/mission-panel-frontend-error.log',
      out_file: '/tmp/mission-panel-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
