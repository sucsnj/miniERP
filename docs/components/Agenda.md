# `src/components/Agenda.tsx`

## Descrição

Painel da página de Contas a Pagar com três seções: **Agenda** (total pendente agrupado por vencimento), **Próximas contas** e **Leitura de Contas** (embute `OcrUpload`).

## Interface

```ts
interface AgendaProps {
  contasMes: ContaDetalhe[];   // declarada, porém NÃO usada (prop morta)
  contasAno: ContaDetalhe[];   // única fonte usada pelo componente
}

const Agenda: React.FC<AgendaProps> = ({ contasAno }) => ...
```

- O destructuring só recebe `contasAno` — `contasMes` está no tipo mas não é consumido.

## Comportamentos

- **Agenda** (`useMemo` sobre `contasAno`): agrupa por `vencimento` acumulando `totalPendente` apenas de contas `status === 'Pendente'`; filtra itens com `totalPendente > 0`, ordena por `toTimestamp(data)` crescente e corta em **8**.
- **Próximas contas** (`useMemo`): filtra `status === 'Pendente'`, ordena por `toTimestamp(vencimento)`, corta em **12**; exibe `data - distribuidora - valor`.
- Datas formatadas com `formatDateString(vencimento, 'DD-MM-YYYY')`; valores com `formatCurrency(valor, 2)`.
- Seção "Leitura de Contas" (`OcrUpload`) para ler boletos direto da página.
- Estados vazios: "Nenhum vencimento registrado neste mês." (Agenda), "Nenhuma conta pendente encontrada." (próximas).

## Dependências

- `@/components/OcrUpload`
- `src/services/contasService` (tipo `ContaDetalhe`)
- `src/utils/formatter` (`formatCurrency`) e `src/utils/date` (`formatDateString`, `toTimestamp`)
- `src/styles/contas.module.css` (classes `contasPanel`, `agendaPanel`, `panelHeader`, `statusChip`, `proximasPanel`)

## Exemplo de uso

```tsx
<Agenda contasMes={contasMes} contasAno={contasAno} />
```

## Observações

- Embora o header diga "Atualização automática" (`statusChip`), não há polling/subscrição — o conteúdo reflete as props recebidas da página.
- `contasMes` aparece no tipo e no uso da página mas é ignorado internamente (candidato a remoção).
- Usado apenas em `src/pages/contas-a-pagar.tsx`.

## Uso

- `src/pages/contas-a-pagar.tsx` (rolagem lateral à direita com as contas do mês).