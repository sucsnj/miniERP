# `src/utils/pix.ts`

> Geração do payload PIX estático (EMVCo) e validação de chaves.

## O que faz

- `buildPixPayload({ pixKey, merchantName, merchantCity, amount?, txid? })` monta o payload TLV + CRC16 e devolve `{ payload, fields }`.
- `validatePixKey(value, forcedType?)` classifica/valida a chave (CPF, CNPJ, e-mail, telefone, aleatória).
- Auxiliares: `emv`, `crc16`, `normalizeText`, `amountToPayload`, `isValidCpf`, `isValidCnpj`, `KEY_TYPES`.

## Relações

- **Usado por:** `useDailySaleForm` (payload do QR Code).

## Notas

- Segue o Manual PIX/BACEN: CRC16-CCITT-FALSE, limites de nome (25) e cidade (15).
