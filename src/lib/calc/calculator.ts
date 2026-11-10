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

export function insertKey(expression: string, key: string): string {
  if (!VALID_KEY_REGEX.test(key)) return expression
  if (expression.length >= EXPRESSION_LIMIT) return expression

  const last = expression.at(-1) ?? ''
  const isOperator = OPERATOR_REGEX.test(key)
  const isUnaryMinus =
    key === '-' && (expression === '' || last === '(' || OPERATOR_REGEX.test(last))

  // Operadores binários substituem o operador anterior; o menos unário é anexado.
  if (isOperator && OPERATOR_REGEX.test(last) && !isUnaryMinus) {
    return `${expression.slice(0, -1)}${key}`
  }

  const isSeparator = key === ',' || key === '.'

  if (isSeparator) {
    const chunk = currentDigits(expression)
    if (chunk === '' || chunk.includes('.') || chunk.includes(',')) return expression
    return `${expression}.`
  }

  if (key === ')') {
    if (OPERATOR_REGEX.test(last) || last === '(') return expression
    const { open, close } = countParentheses(expression)
    if (close >= open) return expression
  }

  if (key === '(' && (NUMBER_REGEX.test(last) || last === ')')) {
    return `${expression}*${key}`
  }

  if (NUMBER_REGEX.test(key) && last === ')') {
    return `${expression}*${key}`
  }

  return `${expression}${key}`
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

    if (
      char === '-' &&
      (lastType === null || lastType === 'operator' || lastType === 'open' || lastType === 'unary')
    ) {
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

export function calculate(expression: string): number | null {
  const complete = expression.trim()
  if (isEmpty(complete)) return null

  // Um sinal final não invalida a expressão: mostra o cálculo parcial possível.
  const withoutTrailingOperators = complete.replace(/[+\-*/]+$/, '')
  if (isEmpty(withoutTrailingOperators)) return null

  // Multiplicação implícita também é aceita em expressões já montadas/coladas.
  const normalized = withoutTrailingOperators
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
  const value = calculate(expression)
  return value === null ? null : roundCurrency(value)
}
