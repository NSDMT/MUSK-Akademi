#!/usr/bin/env bash
# =============================================================
# Muzaffer Uğur Spor Kulübü — Sunucu Kurulum Scripti
# Hetzner CX22 — Ubuntu 24.04 LTS
#
# Kullanım (root olarak):
#   chmod +x deploy/setup.sh
#   bash deploy/setup.sh
# =============================================================

set -euo pipefail

DOMAIN="xn--musksporkulb-nlbb.com"      # musksporkulübü.com punycode
APP_DIR="/var/www/sporsite"
REPO_URL="https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git"  # ← değiştir
ADMIN_EMAIL="admin@musksporkulubu.com"                            # ← değiştir

echo "======================================================"
echo "  Muzaffer Uğur Spor — Sunucu Kurulumu Başlıyor"
echo "======================================================"

# --- 1. Sistem güncellemesi ---
echo "[1/9] Sistem güncelleniyor..."
apt-get update -qq && apt-get upgrade -y -qq

# --- 2. Node.js 22 (node:sqlite için zorunlu) ---
echo "[2/9] Node.js 22 kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null
apt-get install -y nodejs > /dev/null
node -v && npm -v

# --- 3. Nginx + Certbot ---
echo "[3/9] Nginx ve Certbot kuruluyor..."
apt-get install -y nginx certbot python3-certbot-nginx > /dev/null

# --- 4. Chrome/Puppeteer bağımlılıkları (whatsapp-web.js için) ---
echo "[4/9] Puppeteer/Chrome bağımlılıkları kuruluyor..."
apt-get install -y \
  ca-certificates fonts-liberation libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
  libpango-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
  libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  wget xdg-utils > /dev/null

# --- 5. PM2 ---
echo "[5/9] PM2 kuruluyor..."
npm install -g pm2 > /dev/null

# --- 6. Uygulama klasörü ve repo ---
echo "[6/9] Uygulama klonlanıyor..."
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  echo "  Repo mevcut, güncelleniyor..."
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# --- 7. Bağımlılıklar ve build ---
echo "[7/9] Bağımlılıklar yükleniyor ve frontend build ediliyor..."
npm ci --silent
cd server && npm ci --silent && cd ..
npm run build

# .env dosyasını kopyala (henüz yoksa)
if [ ! -f "server/.env" ]; then
  cp server/.env.production.example server/.env
  echo ""
  echo "⚠️  server/.env oluşturuldu — lütfen değerleri doldurun:"
  echo "    nano $APP_DIR/server/.env"
  echo ""
fi

# Log dizini
mkdir -p /var/log/pm2

# --- 8. Nginx konfigürasyonu ---
echo "[8/9] Nginx yapılandırılıyor..."
cp deploy/nginx.conf /etc/nginx/sites-available/musksporkulubu
ln -sf /etc/nginx/sites-available/musksporkulubu /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- SSL sertifikası ---
echo "  SSL sertifikası alınıyor..."
certbot --nginx \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos \
  -m "$ADMIN_EMAIL" \
  --redirect
systemctl reload nginx

# --- 9. PM2 ile uygulamayı başlat ---
echo "[9/9] Uygulama PM2 ile başlatılıyor..."
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "======================================================"
echo "  ✅ Kurulum tamamlandı!"
echo "  🌍 https://$DOMAIN"
echo ""
echo "  PM2 komutları:"
echo "    pm2 status           → servisleri gör"
echo "    pm2 logs             → canlı loglar"
echo "    pm2 restart all      → yeniden başlat"
echo ""
echo "  Güncelleme için: bash deploy/update.sh"
echo "======================================================"
