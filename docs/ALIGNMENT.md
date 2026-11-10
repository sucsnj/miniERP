# ALIGNMENT.md — Guia de alinhamento (domínio e refatoração)

> **Objetivo:** permitir que qualquer agente ou dev se alinhe lendo o mínimo de código, mantendo em um só lugar o **domínio**, a **intenção** e os **pontos de atenção** para a futura refatoração. Documento vivo: alimentado com o contexto passado pelo dono do sistema (este arquivo está em construção — seções marcadas como *aguardando contexto* ainda não foram descritas).
>
> Complementa `CONTEXT.md` (camadas técnicas), `DOCS.md` (arquitetura) e `PROJECT_STATUS.md` (estado). A leitura recomendada para alinhamento é: **este arquivo → `CONTEXT.md` → `DOCS.md` → docs por camada**.

## 1. Negócio e usuários

### 1.1 O estabelecimento

- Começou como **farmácia** e **se expandiu para outros ramos** de comércio (*detalhar ramos atuais — aguardando contexto*).
- O sistema **não substitui por completo o ERP existente**: nasceu como um complemento para a rotina em que o ERP se mostrou inviável.

### 1.2 Origem do sistema

- A necessidade surgiu porque o **ERP em uso era confuso para pessoas de idade mais avançada** operarem.
- A primeira versão era **apenas um dashboard para registrar vendas** — e essa parte continua sendo a **essência** do app.
- O restante das funcionalidades **surgiu com a necessidade** do dia a dia e foi se acumulando (ver seção de fluxos).

### 1.3 Público-alvo e acesso

- **Foco em pessoas com pouca familiaridade com TI**, em especial idosos — para o registro de vendas.
- **Uso individual** (efetivamente um único usuário) → **não há autenticação** hoje por isso.
- Acesso essencialmente **via VPN (Tailscale)**; os dados ficam em bancos SQLite locais no servidor.
- Aplicativo usado por mais de uma pessoa? → single-user, mas vale registrar: os *outros fluxos* (não-venda) exigem algum nível de familiaridade com TI, o que é aceito como inevitável.

### 1.4 Requisitos de UX do fluxo principal (vendas)

- **Letras/interface grandes** (problemas de vista são comuns no público).
- **Simplicidade máxima**: para registrar uma venda basta **digitar o valor e apertar ENTER** — nada mais.

### 1.5 Como o sistema é usado na prática

- **Registrar vendas é a rotina principal** e de longe a mais usada.
- As demais áreas (contas, estoque/cadastro, tabela, relatórios) são usadas com frequência, mas **muito menos** que o registro diário de vendas.

## 2. Fluxos de negócio principais

*aguardando contexto* — descrever a rotina típica (abrir, registrar venda → PIX/impressão, pagar contas, conferir/ajustar estoque, fechar o dia/mês, importações XML/OCR, tabela de medicamentos).

## 3. Regras de domínio com peso de negócio

*aguardando contexto* — por ora, registre-se a observação do dono:
- As regras **ainda estão se moldando com o uso diário**; nada aqui é "estático".
- O estado atual do sistema **já está muito além do que foi planejado**, inclusive antes da expansão de ramos — ou seja, há **funcionalidade acumulada sem planejamento** (fortemente relacionada às motivações de refatoração).

## 4. Foco da refatoração (o que incomoda hoje)

### 4.1 UX/UI sem padrão

- **Não há um padrão para toda a aplicação**: telas/fluxos criados em momentos diferentes não seguem convenções visuais nem de comportamento consistentes.

### 4.2 Modularização e separação de camadas

- **Não há separação clara entre Backend, Frontend e banco** em vários pontos.
- O que o código deveria deixar explícito: onde mora cada camada (UI / regra / acesso a dados) e como elas se comunicam.

### 4.3 Duplicação de lógica (causa raiz)

- **Muitas funções e variáveis são recriadas** em pontos diferentes da aplicação mesmo já existindo.
- **Por que acontece**: o dono esquece o que já fez ou não lembra onde usou. Ao criar algo novo, em vez de **documentar, modularizar e levar para uma área de acesso global**, a função fica **presa num arquivo** — e a mesma lógica acaba escrita de novo em outro local.
- Consequência prática: correções e evoluções precisam ser replicadas em vários lugares (risco de divergência).

### 4.4 Invariantes que a refatoração não pode quebrar

- **Não complicar o registro de vendas**: é a parte dedicada a pessoas com pouca familiaridade com TI — "digita o valor e aperta ENTER". Qualquer camada nova de abstração/tipagem não pode vazar complexidade para essa tela.
- **Sem autenticação no escopo atual**: não inventar auth nem infra de multiusuário sem necessidade real.
- **App é single-process** (front + API no mesmo Next) acessado via VPN — não partir para arquitetura cliente-servidor distribuída por padrão.
- **Conhecimento do domínio é empírico**: as regras continuam evoluindo; a refatoração deve **facilitar mudanças** (camadas e nomes claros), não fixar regras no código que o dono não pediu.

### 4.5 Direção assumida para a refatoração

- **Padronizar UX/UI** em toda a aplicação (um só padrão visual/comportamental).
- **Modularizar com camadas claras** (frontend / backend/regras / banco) e acesso a funções **compartilhadas** em lugar único e descobrível.
- **Eliminar duplicação**: localizar pontos repetidos e consolidar na fonte única (ver também `docs/DOCS.md` → Sugestões de Melhoria).

## 5. Como usar este arquivo

1. Sempre que a refatoração tocar um fluxo, volte à seção 2 para conferir o comportamento esperado de negócio (e ajuste os testes/abstrações contra ele).
2. Ao refatorar, preserve as invariantes da seção 4 e registre em ADR toda decisão estrutural nova.