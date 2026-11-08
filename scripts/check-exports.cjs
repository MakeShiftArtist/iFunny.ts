// Verifies the built package loads identically via require() and import.
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.join(__dirname, "..");
const pkg = require(path.join(root, "package.json"));

// Classes, functions and namespace objects (`export * as X`) are separate
// objects per build, so they are compared by shape rather than identity.
function compare(a, b, name, seen = new Set()) {
    if (typeof b === "function") {
        assert.strictEqual(typeof a, "function", `export ${name} differs`);
    } else if (b === null || typeof b !== "object") {
        assert.strictEqual(a, b, `export ${name} differs`);
        return;
    } else {
        assert.ok(a && typeof a === "object", `export ${name} differs`);
    }
    if (seen.has(b)) return;
    seen.add(b);
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    assert.deepStrictEqual(aKeys, bKeys, `export ${name} members differ`);
    for (const k of bKeys) compare(a[k], b[k], `${name}.${k}`, seen);
}

(async () => {
    const cjs = require(path.join(root, pkg.exports["."].require.default));
    const esm = await import(
        pathToFileURL(path.join(root, pkg.exports["."].import.default)).href
    );

    // TypeScript's CJS emit exposes a default export as `exports.default`,
    // so both builds list `default` (or neither does) and it is compared
    // like any other export.
    const cjsKeys = Object.keys(cjs).sort();
    const esmKeys = Object.keys(esm).sort();
    assert.ok(cjsKeys.length > 0, "CJS build exports nothing");
    assert.deepStrictEqual(esmKeys, cjsKeys, "ESM and CJS exports differ");
    for (const k of cjsKeys) compare(esm[k], cjs[k], k);

    console.log(
        `OK: ${cjsKeys.length} runtime exports match across CJS and ESM`,
    );
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
