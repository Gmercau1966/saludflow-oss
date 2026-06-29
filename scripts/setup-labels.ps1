$ErrorActionPreference = "Stop"

gh auth status | Out-Null

gh label create "feature"  --color "1D76DB" --description "Nueva capacidad o mejora funcional" --force
gh label create "security" --color "B60205" --description "Seguridad, privacidad, permisos o amenazas" --force
gh label create "data"     --color "5319E7" --description "Modelo de datos, migraciones, RLS o datasets" --force
gh label create "ai"       --color "7057FF" --description "Agente, prompts, modelos, tools o RAG" --force
gh label create "eval"     --color "0E8A16" --description "Evaluaciones, graders, métricas o regresiones" --force
gh label create "docs"     --color "0075CA" --description "Documentación y diagramas" --force
gh label create "bug"      --color "D73A4A" --description "Comportamiento incorrecto o regresión" --force

Write-Host "Labels configured."
