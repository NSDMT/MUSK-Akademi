// PM2 process yöneticisi konfigürasyonu
// Kullanım: pm2 start deploy/ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: 'musksporkulubu-api',
      script: './server/index.js',
      cwd: '/var/www/sporsite',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',

      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Log dosyaları
      error_file: '/var/log/pm2/musksporkulubu-error.log',
      out_file: '/var/log/pm2/musksporkulubu-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Crash sonrası yeniden başlatma ayarları
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
