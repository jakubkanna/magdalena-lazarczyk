import { copyFile, mkdir, writeFile } from "node:fs/promises";

await copyFile("build/client/index.html", "build/client/404.html");
await mkdir("build/client/homepage-2", { recursive: true });
await copyFile("build/client/index.html", "build/client/homepage-2/index.html");
await writeFile("build/client/.nojekyll", "");
