#!/usr/bin/env bash
# Levanta PostgreSQL (Docker), el backend (:3001) y el frontend (:3000). Ctrl+C detiene todo.
# Uso: ./dev.sh           (PostgreSQL en Docker)
#      ./dev.sh --sin-db  (base en memoria, no requiere Docker; los datos se pierden al salir)
#      ./dev.sh --demo    (además carga cuentas y vacantes de ejemplo; se pueden combinar)
set -euo pipefail
cd "$(dirname "$0")"

# npx lanza procesos node hijos: se mata el grupo completo para no dejar puertos ocupados.
trap 'trap - INT TERM EXIT; kill 0' INT TERM EXIT

for app in backend frontend; do
  [ -d "$app/node_modules" ] || (echo "Instalando dependencias de $app..." && cd "$app" && npm install --silent)
done

if [[ " $* " == *" --sin-db "* ]]; then
  export DB_TYPE=sqljs
else
  if docker compose version >/dev/null 2>&1; then compose="docker compose"; else compose="docker-compose"; fi
  $compose up -d --wait
fi

(cd backend && exec npx ts-node src/main.ts) &
back=$!
(cd frontend && exec npx next dev -p 3000) &
front=$!

if [[ " $* " == *" --demo "* ]]; then node scripts/seed-demo.mjs & fi

echo "Frontend: http://localhost:3000   Backend: http://localhost:3001"
# si uno de los dos cae, se detiene el otro (por el trap)
while kill -0 "$back" 2>/dev/null && kill -0 "$front" 2>/dev/null; do sleep 1; done
