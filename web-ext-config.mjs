// Firefox: `npx web-ext@10.8.0 build` and `lint` read this. The package holds the same 5 files as the Chrome zip.
export default {
  ignoreFiles: ['store', 'scripts', 'dist', '*.md', 'LICENSE', '.DS_Store', '.gitignore', 'web-ext-config.mjs'],
  build: { overwriteDest: true },
};
