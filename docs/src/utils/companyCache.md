# `src/utils/companyCache.ts`

> Cache em memória por processo para `companyName` usado em `AuthContext`.

## O que faz

- `readCompanyNameCache(companyId)`: retorna o nome cacheado se ainda não venceu o TTL (10 minutos); limpa e retorna `null` caso tenha expirado.
- `writeCompanyNameCache(companyId, value)`: armazena o nome da empresa por 10 minutos.
- `invalidateCompanyNameCache(companyId)`: remove imediatamente o nome cacheado da empresa atual.

## Relações

- **Usa:** nenhum helper externo.
- **Usado por:** `src/utils/serverAuth.ts`, `/api/admin/company`.

## Notas

- Chave/valor são estritamente por tenant (`companyId`); não vaza nome entre empresas.
- Atualizações pelo `/api/admin/company` invalidam o cache imediatamente.
- Em múltiplas instâncias serverless o cache pode ficar defasado entre processos; aceito porque o valor é decorativo e o TTL é curto.
