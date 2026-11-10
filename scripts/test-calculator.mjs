import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(os.tmpdir(), 'sistema-vendas-calc-test');

execSync(
  `npx tsc src/lib/calc/engine.ts src/lib/calc/calculator.ts --module commonjs --target es2022 --outDir "${outDir}" --skipLibCheck --esModuleInterop --forceConsistentCasingInFileNames`,
  { cwd: root, stdio: 'inherit' },
);

const require = createRequire(import.meta.url);
const calc = require(path.join(outDir, 'calculator.js'));

let passed = 0;
let failed = 0;

function assertEqual(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    console.log(`PASS ${name}: ${JSON.stringify(actual)}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}: actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
  }
}

// Baseline do comportamento atual. Casos marcados como bug registram o comportamento
// atual para comparação nas fases seguintes.
const cases = [
  ['insertKey vazio + 1', calc.insertKey('', '1'), '1'],
  ['insertKey 1 + +', calc.insertKey('1+', '+'), '1+'],
  ['insertKey 2* + + (agora substitui)', calc.insertKey('2*', '+'), '2+'],
  ['insertKey 1.2 + . (rejeita segundo ponto)', calc.insertKey('1.2', '.'), '1.2'],
  ['insertKey 2 + (', calc.insertKey('2', '('), '2*('],
  ['insertKey () + ) (rejeita fechamento extra)', calc.insertKey('()', ')'), '()'],
  ['sanitizeExpression filtra lixo', calc.sanitizeExpression('1a2+3'), '12+3'],
  ['sanitizeExpression converte virgula', calc.sanitizeExpression('1,2+3'), '1.2+3'],
  ['calculate precedencia', calc.calculate('1+2*3'), 7],
  ['calculate parenteses', calc.calculate('(1+2)*3'), 9],
  ['calculate soma simples', calc.calculate('2+3'), 5],
  ['calculate operador final mostra parcial', calc.calculate('2+'), 2],
  ['calculate 5+ mostra 5', calc.calculate('5+'), 5],
  ['calculate 5+7-4+ mostra 8', calc.calculate('5+7-4+'), 8],
  ['calculate vazio', calc.calculate(''), null],
  ['calculate ponto isolado', calc.calculate('.'), null],
  ['calculate dois pontos', calc.calculate('1..2'), null],
  ['calculate divisao por zero', calc.calculate('1/0'), null],
  ['calculate float bruto (calculateResult arredonda)', calc.calculate('0.1+0.2'), 0.30000000000000004],
  ['calculate parenteses validos', calc.calculate('(2)'), 2],
  ['calculate parenteses vazios', calc.calculate('()'), null],
  ['calculate multiplicacao implicita', calc.calculate('2(3)'), 6],
  ['calculate sinal unario', calc.calculate('-5'), -5],
  ['calculate sinal unario em parenteses', calc.calculate('(-2)'), -2],
  ['calculate sinal unario apos operador', calc.calculate('5*(-2)'), -10],
  ['calculate sinal unario duplo', calc.calculate('--5'), 5],
  ['calculate multiplicacao implicita apos fecha', calc.calculate('(2)3'), 6],
  ['calculate operador final com unario pendente', calc.calculate('5*-'), 5],
  ['calculateResult arredonda', calc.calculateResult('1/3'), 0.33],
];

for (const [name, actual, expected] of cases) {
  assertEqual(name, actual, expected);
}

console.log(`\nResultado: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) process.exitCode = 1;



