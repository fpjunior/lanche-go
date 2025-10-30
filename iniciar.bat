@echo off
echo 🚀 Iniciando LancheGo...
echo.

cd /d "c:\ws\teste\lanche-go\frontend"

echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo ⬇️ Instalando dependências...
    npm install
) else (
    echo ✅ Dependências já instaladas!
)

echo.
echo 🌐 Iniciando servidor de desenvolvimento...
echo 📱 O sistema estará disponível em: http://localhost:4200
echo 🔐 Login demo: demo@lanchego.com / 123456
echo.

npm start