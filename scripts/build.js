// scripts/build.js
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const Handlebars = require("handlebars");

const viewsDir = path.join(__dirname, "..", "views");
const publicDir = path.join(__dirname, "..", "public");
const outDir = path.join(__dirname, "..", "dist");

async function build() {
  await fs.remove(outDir);
  await fs.ensureDir(outDir);
  await fs.copy(publicDir, path.join(outDir, "public"));

  const files = glob.sync("**/*.hbs", { cwd: viewsDir });

  for (const file of files) {
    const tplPath = path.join(viewsDir, file);
    const tplStr = await fs.readFile(tplPath, "utf8");
    const tpl = Handlebars.compile(tplStr);

    const html = tpl({});
    const fileName = file.replace(".hbs", ".html");
    const outPath = path.join(outDir, fileName);

    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, html, "utf8");
    console.log("Built:", outPath);
  }

  console.log("✅ All static files built!");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
