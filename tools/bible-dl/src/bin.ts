import { main } from './cli';

// Entry point: `bin/bible-dl` spawns `node --import tsx src/bin.ts`.
main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(`bible-dl: ${(error as Error).message}`);
    process.exitCode = 1;
});
