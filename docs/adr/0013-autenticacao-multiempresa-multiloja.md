# ADR 0013 — Autenticação personalizada e multiempresa/multi-loja

- **Status:** aceito (11/11/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 11/11/2026.

## Contexto

O ERP está estável sobre Supabase/Postgres, mas não possui autenticação, controle de usuários ou isolamento entre empresas. O uso previsto passa a ser:

- vários administradores, cada um com sua própria empresa;
- no máximo 1 empresa por admin;
- no máximo 2 lojas por empresa;
- vendedores (`merchant`) com acesso limitado às lojas autorizadas;
- dados de empresas completamente isolados;
- dados cadastrais compartilhados entre lojas da mesma empresa;
- dados transacionais separados por loja;
- configurações da empresa como padrão, com sobrescritas locais.

A autenticação por e-mail não será usada neste momento por limitações do plano do Supabase. O bootstrap do primeiro admin deve acontecer com um `PIN_MASTER` em variável de ambiente.

## Decisão

1. **Autenticação própria, sem Supabase Auth.**
   - Login por `login` ou `email` + senha.
   - `login`: mínimo 4 caracteres, apenas letras `A-Za-z`, normalizado para lowercase e único.
   - `email`: obrigatório, único e também aceito como identificador.
   - Senha:
     - mínimo 8 caracteres;
     - ao menos 1 letra;
     - ao menos 1 número;
     - ao menos 1 caractere especial da whitelist segura:
       ```txt
       !@#$%^&*()_+-=[]{}:;,.<>?
       ```
     - sem caracteres de controle;
     - máximo 128 caracteres;
     - hash com `scrypt` do Node (`node:crypto`) e salt individual.

2. **Sessão opaca no banco.**
   - Cookie `minierp_session`.
   - `HttpOnly`.
   - `Secure` em produção.
   - `SameSite=Lax`.
   - Duração de **2 dias** (48 horas).
   - Cookie contém apenas um token aleatório de 256 bits.
   - A tabela `sessions` guarda somente o hash do token (`token_hash`).
   - Logout revoga a sessão.
   - Sessões expiradas são rejeitadas/limpas.
   - `user.active = false` invalida o acesso mesmo com sessão válida.

3. **Bootstrap do primeiro admin via `PIN_MASTER`.**
   - `PIN_MASTER` existe apenas no ambiente server-side; nunca `NEXT_PUBLIC_*`.
   - `/setup` fica disponível somente enquanto não existir nenhum admin.
   - O bootstrap cria, em transação:
     - empresa;
     - usuário admin;
     - vínculo empresa ↔ admin;
     - primeira loja somente se o fluxo de setup assim decidir;
     - sessão autenticada.
   - Após existir qualquer admin, o bootstrap retorna `403`. **Alterado:** a partir da multi-empresa, bootstraps posteriores com `PIN_MASTER` criam um novo tenant ao invés de bloquear (ver [ADR 0015](./0015-multiplos-admins-por-bootstrap.md)).
   - Comparação do PIN com `crypto.timingSafeEqual`.
   - Admins posteriores são criados por admins já autenticados.

4. **Roles `admin` e `merchant`.**
   - `admin`:
     - leitura/escrita no escopo da própria empresa;
     - gestão de empresa, lojas, vendedores, autorizações, configurações e PIX;
     - acesso a produtos, serviços, cadastros, payables/invoices, importação, backups e consolidações.
   - `merchant`:
     - leitura no escopo da empresa/lojas autorizadas;
     - escrita apenas em vendas:
       - criar venda;
       - editar venda (mantendo a regra de edição de 2 dias existente);
       - gerar PIX da venda;
     - não pode:
       - excluir vendas;
       - alterar PIX;
       - alterar configurações da empresa;
       - gerir empresa, lojas ou usuários;
       - alterar produtos/serviços/cadastros/payables/invoices;
       - executar backup, importação ou consolidação.

5. **Multiempresa com tenant explicitamente aplicado no servidor.**
   - Todas as tabelas de negócio recebem `company_id`.
   - Tabelas transacionais também recebem `store_id`:
     - `sales`;
     - `monthly_sales`.
   - `sale_items` pode depender da venda, mas se for usado em queries próprias deve carregar `company_id`.
   - Como o app usa `service_role`, RLS não é a barreira principal.
   - Todo repositório/RPC que consulta ou altera dados recebe `AuthContext` e aplica `company_id` obrigatoriamente.
   - Middleware sozinho não é proteção suficiente; todas as API routes validam sessão e role server-side.

6. **Modelos de tenant.**

   ```sql
   companies (
     id uuid primary key,
     name text not null,
     admin_user_id uuid not null unique references users(id),
     created_at timestamptz not null,
     updated_at timestamptz not null
   )

   users (
     id uuid primary key,
     company_id uuid references companies(id) on delete cascade,
     role text not null check (role in ('admin', 'merchant')),
     name text not null,
     login text not null unique,
     email text not null unique,
     password_hash text not null,
     active boolean not null default true,
     last_store_id uuid references stores(id),
     created_at timestamptz not null,
     updated_at timestamptz not null
   )

   stores (
     id uuid primary key,
     company_id uuid not null references companies(id) on delete cascade,
     name text not null,
     active boolean not null default true,
     created_at timestamptz not null,
     updated_at timestamptz not null
   )

   user_stores (
     user_id uuid not null references users(id) on delete cascade,
     store_id uuid not null references stores(id) on delete cascade,
     primary key (user_id, store_id)
   )
   ```

   Restrição de máximo de 2 lojas por empresa:
   - validação server-side;
   - trigger/constraint no banco;
   - teste de concorrência antes de ativar em produção.

7. **Isolamento absoluto entre empresas.**
   - Admin e merchant nunca veem dados de outra empresa.
   - Mesmo IDs válidos de outro tenant são tratados como inexistentes.
   - Listagens, detalhes, updates, deletes, exports, backups e consolidações filtram por `company_id`.
   - Operações compostas mantêm atomicamente a seleção do tenant.
   - Nenhum endpoint aceita `company_id` livre do cliente como autoridade; o tenant vem apenas da sessão.

8. **Multi-loja.**
   - Admin acessa todas as lojas da própria empresa.
   - Merchant acessa apenas lojas explicitamente vinculadas em `user_stores`.
   - Selector de loja na navegação.
   - `admin` vê todas as lojas da empresa; `merchant`, apenas as autorizadas.
   - Seleção persistida em `users.last_store_id` e validada a cada requisição.
   - Dados cadastrais são compartilhados dentro da empresa.
   - Vendas e consolidações são separadas por loja.
   - Haverá, no futuro, uma rota/visão de consolidado da empresa; fica fora do escopo inicial.

9. **Configurações da empresa como padrão, com sobrescrita local.**
   - `company_settings` contém os padrões da empresa:
     - tema;
     - timezone;
     - `recent_sales_count`;
     - foco automático;
     - delay do foco automático;
     - PIX obrigatório.
   - Valores locais em `localStorage` funcionam como override para preferências locais:
     - tema;
     - timezone;
     - recentes;
     - foco automático;
     - delay.
   - Precedência:
     ```txt
     localStorage válido → company_settings → default do app
     ```
   - PIX nunca tem override local.
   - PIX é lido de `company_settings`.
   - Admin altera configurações da empresa; merchant não altera.
   - Opcional: ação “usar padrão da empresa” remove overrides locais.

10. **Migração dos dados atuais.**
    - Antes de qualquer migration: backup completo.
    - Dados existentes são vinculados à primeira empresa/loja.
    - Estratégia:
      1. adicionar `company_id`/`store_id` nullable;
      2. criar tenant padrão;
      3. fazer backfill dos dados existentes;
      4. tornar colunas `not null`;
      5. adicionar FKs e índices;
      6. atualizar RPCs e repositórios.
    - Se o banco estiver vazio, o tenant nasce apenas no bootstrap do primeiro admin.
    - Backups e exports passam a ser filtrados por empresa.

11. **Fases pausadas.**
    - Fase 0: ADR e definição.
    - Fase 1: schema/migration.
    - Fase 2: auth core.
    - Fase 3: repositories/API com tenant.
    - Fase 4: permissões admin/merchant na API.
    - Fase 5: UI, guards, nav e store switcher.
    - Fase 6: admin de empresa/lojas/vendedores.
    - Fase 7: PIX e company settings + local overrides.
    - Fase 8: consolidações, backups, imports e relatórios por escopo.
    - Fase 9: hardening, testes, docs e deploy.
    - Cada fase termina com teste manual/automatizado e aprovação antes da próxima.

## Consequências

**Positivas**

- Isolamento real por empresa.
- Modelo simples para enforçar tenant sem depender de RLS.
- Login por `login` ou `email`, sem depender de SMTP/e-mail.
- Sessão revogável e de duração controlada.
- Merchants com superfície reduzida ao fluxo de vendas.
- Configurações centralizadas por empresa, com overrides locais controlados.
- Base compatível com futuro consolidado empresarial e eventual Supabase Auth.

**Negativas / aceitas**

- Autenticação própria exige cuidado contínuo com segurança.
- Toda API e repositório deve ser auditado para aplicar filtros de tenant.
- Migração toca quase todas as camadas.
- `scrypt` pode ser substituído por Argon2id posteriormente; a interface não precisa mudar.
- Compartilhamento apenas entre lojas da mesma empresa precisa ser validado explicitamente.
- Override local cria duas fontes de configuração; o código centraliza merge/validação no `SettingsContext`.

## Alternativas consideradas

- **Supabase Auth com e-mails sintéticos:** reduz código próprio, mas ainda depende da infraestrutura Auth/cota do plano; rejeitada para respeitar a limitação do plano e o requisito de login por `login`/`email`.
- **Supabase Auth por e-mail:** não usar agora por limitação/decisão de produto.
- **JWT stateless:** sem necessidade de tabela e consulta, mas revogação e alteração de loja ativa complicam; sessão opaca foi preferida.
- **RLS como enforcement principal:** o app usa `service_role`, portanto RLS não filtra consumidores server-side; tenant filter no código é obrigatório.
- **bcryptjs:** viável, mas `scrypt` do Node evita dependência nativa e atende ao requisito.
- **Configurações somente locais:** rejeitada; padrões pertencem à empresa e PIX não pode ficar no browser.
- **Configurações somente da empresa:** rejeitada para tema/recentes/autofocus; sobrescrita local melhora UX por dispositivo.

## Referências

- `docs/supabase.md`
- `supabase/schema.sql`
- `docs/adr/0004-padrao-de-nomenclatura-dos-identificadores.md`
- `docs/adr/0012-migracao-sqlite-para-supabase.md`
- `src/database/supabase.ts`
- `src/utils/env.ts`
- `src/pages/_app.tsx`
- `src/contexts/SettingsContext.tsx`
