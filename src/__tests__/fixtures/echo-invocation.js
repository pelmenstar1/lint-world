import fsp from 'node:fs/promises';

const [outFile, ...args] = process.argv.slice(2);

await fsp.writeFile(outFile, JSON.stringify({ args, path: process.env.PATH }));
