import { build, emptyDir } from "@deno/dnt";
import pkg from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
    entryPoints: ["./src/index.ts"],
    scriptModule: "cjs",
    importMap: "deno.json",
    // esModule: true,
    outDir: "./npm",
    //declaration: "separate",
    shims: {
        // see JS docs for overview and more options
        deno: true,
    },
    package: {
        // package.json properties
        name: "ifunny.ts",
        version: pkg.version,
        description: "An iFunny API wrapper written in TypeScript",
        license: "CC0-1.0",
        repository: {
            type: "git",
            url: "git+https://github.com/MakeShiftArtist/iFunny.ts.git",
        },
        bugs: {
            url: "https://github.com/MakeShiftArtist/iFunny.ts/issues",
        },
    },
    postBuild() {
        // steps to run after building and before running the tests
        Deno.copyFileSync("LICENSE", "npm/LICENSE");
        Deno.copyFileSync("README.md", "npm/README.md");
    },
});
