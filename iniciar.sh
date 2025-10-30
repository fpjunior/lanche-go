#!/bin/bash

echo "🚀 Iniciando LancheGo..."
echo

cd "c:/ws/teste/lanche-go/frontend"

echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "⬇️ Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas!"
fi

echo
echo "🌐 Iniciando servidor de desenvolvimento..."
echo "📱 O sistema estará disponível em: http://localhost:4200"
echo "🔐 Login demo: demo@lanchego.com / 123456"
echo

npm start