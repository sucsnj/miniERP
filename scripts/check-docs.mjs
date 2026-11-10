import fs from "node:fs";
import path from "node:path";

// Valida que docs/src espelha src (um .md por arquivo-fonte) e que os links
// internos dos docs resolvem. Padrão de uso: node scripts/check-docs.mjs
// (exit 1 se houver pendência). Ver docs/documentation-guidelines.md.

const root = process.cwd();
const SRC = path.join(root, "src");
const DOCS = path.join(root, "docs", "src");
const SOURCE_EXT = new Set([".ts", ".tsx"]);

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const rel = (base, p) => path.relative(base, p).split(path.sep).join("/");

const sourceFiles = walk(
  SRC,
  (p) => SOURCE_EXT.has(path.extname(p)) && !p.endsWith(".d.css.ts")
);
const docFiles = walk(DOCS, (p) => path.extname(p) === ".md");
const allDocFiles = walk(path.join(root, "docs"), (p) => path.extname(p) === ".md");

const sourceSet = new Set(sourceFiles.map((p) => rel(SRC, p).replace(/\.(ts|tsx)$/, ".md")));
const docSet = new Set(docFiles.map((p) => rel(DOCS, p)));

const missing = [...sourceSet].filter((d) => !docSet.has(d));
const orphans = [...docSet].filter(
  (d) => !sourceSet.has(d) && path.basename(d) !== "README.md"
);
const foreign = walk(DOCS, () => true)
  .filter((p) => path.extname(p) !== ".md")
  .map((p) => rel(DOCS, p));

const brokenLinks = [];
const linkRe = /\]\(([^)]+)\)/g;
for (const f of allDocFiles) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(linkRe)) {
    let target = m[1].trim().split("#")[0];
    if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
    target = target.replace(/\s+/g, " ");
    const resolved = path.resolve(path.dirname(f), decodeURI(target));
    if (!fs.existsSync(resolved)) {
      brokenLinks.push(`${rel(root, f)} -> ${m[1]}`);
    }
  }
}

const report = (title, list) => {
  if (list.length === 0) return;
  console.log(`\n${title} (${list.length}):`);
  for (const item of list.sort()) console.log("  - " + item);
};

report("SEM DOC em docs/src", missing);
report("DOC ORFAO (sem arquivo em src)", orphans);
report("ARQUIVO NAO-.md em docs/src", foreign);
report("LINK QUEBRADO", brokenLinks);

const ok = missing.length + orphans.length + foreign.length + brokenLinks.length === 0;
console.log(ok ? "\nDOCS OK - espelho e links consistentes." : "\nDOCS: pendencias encontradas (ver acima).");
process.exit(ok ? 0 : 1);
