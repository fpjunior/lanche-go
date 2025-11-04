@echo off
echo 🔄 Reiniciando Docker com suporte a imagens...

echo 📦 Parando containers...
docker-compose down

echo 📁 Criando diretório de uploads...
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\uploads\menu" mkdir "backend\uploads\menu"

echo 🚀 Iniciando containers com volumes...
docker-compose up -d

echo ⏳ Aguardando containers iniciarem...
timeout /t 5 /nobreak >nul

echo 🌐 Testando endpoints...
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3002/health
echo.

echo ✅ Docker reiniciado com suporte a imagens!
echo 📝 URLs importantes:
echo    - API: http://localhost:3002
echo    - Imagens: http://localhost:3002/api/images/menu/
echo    - Upload: POST http://localhost:3002/api/images/menu