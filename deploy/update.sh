#!/usr/bin/env bash
# Kod güncellemesi — sunucuda çalıştır: bash deploy/update.sh

set -euo pipefail
APP_DIR="/var/www/sporsite"

echo "🔄 Güncelleme başlıyor..."
cd "$APP_DIR"

git pull
npm ci --silent
cd server && npm ci --silent && cd ..
npm run build

pm2 restart musksporkulubu-api
echo "✅ Güncelleme tamamlandı — $(date)"
