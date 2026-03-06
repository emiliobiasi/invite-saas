# Invite SaaS - Visão Geral

Este monorepo organiza os artefatos da aplicação em pacotes separados:

- `packages/be`: backend (Bun + Elysia)
- `packages/fe`: futuro frontend
- `docs`: documentação compartilhada (contexto geral, decisões de arquitetura, cloud e agente Claude)

## Comandos principais

Na raiz (usa Bun):

- `bun run be:dev` — inicia o backend em modo desenvolvimento
- `bun run be:lint` — lint do backend
- `bun run be:format` — formatador
- `bun run be:typecheck` — typecheck
- `bun run be:migrate` — aplica migrations (drizzle)
- `bun run be:generate` — gera migrações (drizzle)

## Estrutura

```
invite-saas/
  package.json          # workspaces e scripts orquestradores
  docs/                 # documentação compartilhada
  packages/
    be/                 # backend
    fe/                 # frontend (futuro)
```

## Próximos passos

- Criar o pacote `packages/fe` quando o frontend começar.
- Centralizar configs compartilhadas (ex.: `tsconfig.base.json`) se fizer sentido.
- Documentar decisões de arquitetura, cloud e agente Claude em `docs/`.
