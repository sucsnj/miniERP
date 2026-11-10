import fs from "fs/promises";
import path from "path";

// Remove arquivos temporários gerados pelo OCR
export async function cleanTemp() {
  const tempDir = path.join(process.cwd(), "temp");
  const files = await fs.readdir(tempDir);

  await Promise.all(
    files.filter(f => f.endsWith(".png"))
         .map(f => fs.unlink(path.join(tempDir, f)))
  );

  console.log("Temp limpo com sucesso");
}
