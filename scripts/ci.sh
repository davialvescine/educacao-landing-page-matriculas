#!/usr/bin/env bash
#
# CI local. Roda antes de qualquer push — é o portão, não uma sugestão.
#
# Existe porque erro de tipo e quebra de build não aparecem em `npm run
# dev`: as páginas de escola são geradas no build, e dado ruim só estoura
# lá. Descobrir isso depois do push custa uma ida e volta que este script
# corta em dois minutos.
#
#   bash scripts/ci.sh
#
set -uo pipefail
cd "$(dirname "$0")/.."

falhou=0
etapa() {
  local nome="$1"; shift
  printf '\n\033[1m▸ %s\033[0m\n' "$nome"
  if "$@"; then
    printf '\033[32m  ok\033[0m\n'
  else
    printf '\033[31m  FALHOU: %s\033[0m\n' "$nome"
    falhou=1
  fi
}

# Nenhuma etapa interrompe as outras: quem roda quer a lista inteira do
# que está errado, não o primeiro erro e mais uma rodada para achar o
# segundo.
etapa "Tipos"   npx tsc --noEmit
etapa "Testes"  npx vitest run
etapa "Build"   npm run build

# O serviço de tempo real tem package.json próprio e não entra no build
# do Next. Sem esta checagem, erro de sintaxe nele só aparece em produção.
if [ -d tempo-real ]; then
  etapa "Tempo real (sintaxe)" bash -c 'for f in tempo-real/src/*.mjs; do node --check "$f" || exit 1; done'
fi

printf '\n'
if [ "$falhou" -eq 0 ]; then
  printf '\033[32m✓ CI local passou. Pode revisar com o Codex e subir.\033[0m\n'
else
  printf '\033[31m✗ CI local falhou. Não suba.\033[0m\n'
fi
exit "$falhou"
