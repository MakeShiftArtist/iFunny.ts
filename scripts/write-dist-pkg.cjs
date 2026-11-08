// Marks each build output directory with its module format so Node
// interprets dist/cjs/*.js as CommonJS and dist/esm/*.js as ES modules.
const fs = require("fs");
const path = require("path");

for (const [dir, type] of [
    ["cjs", "commonjs"],
    ["esm", "module"],
]) {
    const out = path.join(__dirname, "..", "dist", dir);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(
        path.join(out, "package.json"),
        JSON.stringify({ type }, null, "\t") + "\n",
    );
}
