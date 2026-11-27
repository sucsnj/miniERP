import { roundCurrency } from './engine'

const VALID_KEY_REGEX = /^[0-9+\-*/().,]$/
const OPERATOR_REGEX = /^[+\-*/]$/
const NUMBER_REGEX = /^[0-9]$/
const EXPRESSION_LIMIT = 40

export function isEmpty(expression: string): boolean {
  return expression.length === 0
}

function countParentheses(expression: string): { open: number; close: number } {
  let open = 0
  let close = 0
  for (const char of expression) {
    if (char === '(') open += 1
    if (char === ')') close += 1
  }
  return { open, close }
}

function currentDigits(expression: string): string {
  return /[0-9.,]*$/.exec(expression)?.[0] ?? ''
}

type InputState =
  | 'start'
  | 'afterOperator'
  | 'afterOpen'
  | 'afterNumber'
  | 'afterClose'
  | 'afterSeparator'

type KeyType = 'digit' | 'operator' | 'separator' | 'open' | 'close' | 'other'

function keyTypeOf(key: string): KeyType {
  if (NUMBER_REGEX.test(key)) return 'digit'
  if (key === '-') return 'operator'
  if (OPERATOR_REGEX.test(key)) return 'operator'
  if (key === '.' || key === ',') return 'separator'
  if (key === '(') return 'open'
  if (key === ')') return 'close'
  return 'other'
}

function stateOf(expression: string): InputState {
  const last = expression.at(-1) ?? ''

  if (!expression) return 'start'
  if (last === '.') return 'afterSeparator'
  if (last === '(') return 'afterOpen'
  if (last === ')') return 'afterClose'
  if (OPERATOR_REGEX.test(last)) return 'afterOperator'
  return 'afterNumber'
}

const SUBSTITUTION_KEYS = /^[+\-*/)]$/

function canReplaceWithCloseParenthesis(expression: string): boolean {
  const { open, close } = countParentheses(expression)
  return close < open
}

function replaceLastToken(expression: string, key: string): string {
  return `${expression.slice(0, -1)}${key}`
}

function applySubstitution(expression: string, key: string): string {
  const last = expression.at(-1) ?? ''

  if (!SUBSTITUTION_KEYS.test(last) || !SUBSTITUTION_KEYS.test(key)) {
    return expression
  }

  if (key === ')' && !canReplaceWithCloseParenthesis(expression)) {
    return expression
  }

  return replaceLastToken(expression, key)
}

function applyOpenParenthesis(expression: string, state: InputState): string {
  if (state === 'afterNumber' || state === 'afterClose' || state === 'afterOperator' || state === 'start') {
    if (state === 'afterNumber' || state === 'afterClose') return `${expression}*(`
    return `${expression}(`
  }

  return expression
}

export function insertKey(expression: string, key: string): string {
  if (!VALID_KEY_REGEX.test(key)) return expression
  if (expression.length >= EXPRESSION_LIMIT) return expression

  const normalizedKey = key === ',' ? '.' : key
  const keyType = keyTypeOf(normalizedKey)

  if (expression === ',' || expression === '.') {
    return keyType === 'separator' ? '0.' : `0.${normalizedKey}`
  }

  const state = stateOf(expression)

  switch (state) {
    case 'start':
      if (keyType === 'digit') return `${expression}${normalizedKey}`
      if (keyType === 'operator' && normalizedKey === '-') return normalizedKey
      if (keyType === 'open') return `${expression}${normalizedKey}`
      if (keyType === 'separator') return '0.'
      return expression

    case 'afterOpen':
      if (keyType === 'digit' || (keyType === 'operator' && normalizedKey === '-')) return `${expression}${normalizedKey}`
      if (keyType === 'separator') return `${expression}0.`
      return expression

    case 'afterSeparator':
      if (keyType === 'digit') return `${expression}${normalizedKey}`
      return expression

    case 'afterOperator':
      if (keyType === 'digit') return `${expression}${normalizedKey}`
      if (keyType === 'separator') return `${expression}0.`
      if (keyType === 'open') return `${expression}${normalizedKey}`
      if (keyType === 'operator' || keyType === 'close') return applySubstitution(expression, normalizedKey)
      return expression

    case 'afterNumber':
      if (keyType === 'digit') return `${expression}${normalizedKey}`
      if (keyType === 'separator' && !currentDigits(expression).includes('.')) return `${expression}.`
      if (keyType === 'operator') return `${expression}${normalizedKey}`
      if (keyType === 'close') {
        const { open, close } = countParentheses(expression)
        if (close < open) return `${expression})`
        return expression
      }
      if (keyType === 'open') return applyOpenParenthesis(expression, state)
      return expression

    case 'afterClose':
      if (keyType === 'digit') return `${expression}*${normalizedKey}`
      if (keyType === 'open') return `${expression}*(`
      if (keyType === 'operator') {
        const { open, close } = countParentheses(expression)
        // Se o ')' final fecha um parêntese aberto, não substitui: anexa o operador.
        if (open >= close) return `${expression}${normalizedKey}`
        return applySubstitution(expression, normalizedKey)
      }
      if (keyType === 'close') {
        const { open, close } = countParentheses(expression)
        if (close < open) return `${expression})`
        return expression
      }
      return expression

    default:
      return expression
  }
}

export function deleteKey(expression: string): string {
  return expression.slice(0, -1)
}

export function sanitizeExpression(text: string): string {
  return [...text].reduce((expression, char) => insertKey(expression, char), '')
}

type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: string }
  | { type: 'unary' }
  | { type: 'open' }
  | { type: 'close' }

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3 }

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = []
  let index = 0
  let lastType: Token['type'] | null = null

  while (index < expression.length) {
    const char = expression[index]

    if (NUMBER_REGEX.test(char) || char === '.') {
      let number = ''
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        number += expression[index]
        index += 1
      }
      if (number.split('.').length > 2) return null
      const value = Number(number)
      if (!Number.isFinite(value)) return null
      tokens.push({ type: 'number', value })
      lastType = 'number'
      continue
    }

    if (char === '-' && (lastType === null || lastType === 'open')) {
      tokens.push({ type: 'unary' })
      lastType = 'unary'
      index += 1
      continue
    }

    if (OPERATOR_REGEX.test(char)) {
      tokens.push({ type: 'operator', value: char })
      lastType = 'operator'
    } else if (char === '(') {
      tokens.push({ type: 'open' })
      lastType = 'open'
    } else if (char === ')') {
      tokens.push({ type: 'close' })
      lastType = 'close'
    } else {
      return null
    }

    index += 1
  }

  return tokens
}

function closeMissingParentheses(expression: string): string {
  let balance = 0

  for (const char of expression) {
    if (char === '(') balance += 1
    if (char === ')') balance -= 1
  }

  return balance > 0 ? `${expression}${')'.repeat(balance)}` : expression
}

function trimIncompleteExpression(expression: string): string {
  let trimmed = expression

  while (trimmed.length > 0 && (OPERATOR_REGEX.test(trimmed.at(-1) ?? '') || trimmed.at(-1) === '(')) {
    trimmed = trimmed.slice(0, -1)
  }

  return trimmed
}

export function calculate(expression: string): number | null {
  const complete = expression.trim()
  if (isEmpty(complete)) return null

  // Um sinal final não invalida a expressão: mostra o cálculo parcial possível.
  const withoutTrailingOperators = trimIncompleteExpression(complete)
  if (isEmpty(withoutTrailingOperators)) return null

  const normalized = closeMissingParentheses(withoutTrailingOperators)
    .replace(/(\d)\(/g, '$1*(')
    .replace(/\)(\d)/g, ')*$1')
    .replace(/\)\(/g, ')*(')

  const tokens = tokenize(normalized)
  if (tokens === null || tokens.length === 0) return null

  const output: (number | string)[] = []
  const operators: string[] = []

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token.value)
      continue
    }

    if (token.type === 'unary') {
      operators.push('neg')
      continue
    }

    if (token.type === 'operator') {
      while (
        operators.length > 0 &&
        operators.at(-1) !== '(' &&
        PRECEDENCE[operators.at(-1) ?? ''] >= PRECEDENCE[token.value]
      ) {
        output.push(operators.pop() as string)
      }
      operators.push(token.value)
      continue
    }

    if (token.type === 'open') {
      operators.push('(')
      continue
    }

    while (operators.length > 0 && operators.at(-1) !== '(') {
      output.push(operators.pop() as string)
    }
    if (operators.at(-1) !== '(') return null
    operators.pop()
  }

  while (operators.length > 0) {
    const operator = operators.pop() as string
    if (operator === '(') return null
    output.push(operator)
  }

  const values: number[] = []
  for (const item of output) {
    if (typeof item === 'number') {
      values.push(item)
      continue
    }

    if (item === 'neg') {
      const value = values.pop()
      if (value === undefined) return null
      values.push(-value)
      continue
    }

    const right = values.pop()
    const left = values.pop()
    if (left === undefined || right === undefined) return null
    switch (item) {
      case '+':
        values.push(left + right)
        break
      case '-':
        values.push(left - right)
        break
      case '*':
        values.push(left * right)
        break
      case '/':
        if (right === 0) return null
        values.push(left / right)
        break
      default:
        return null
    }
  }

  if (values.length !== 1) return null
  return Number.isFinite(values[0]) ? values[0] : null
}

export function calculateResult(expression: string): number | null {
  const trimmed = expression.trim()
  if (trimmed === '(' || trimmed === '-') return 0
  const value = calculate(expression)
  return value === null ? null : roundCurrency(value)
}
