## Requirements

Install `llvm` and verify that `llc --version` has wasm32 listed as a registered target.

## Compile

`clang --target=wasm32 -Os -flto -nostdlib -Wl,--no-entry -Wl,--export-all -Wl,--lto-O2 -Wl,-z,stack-size=8388608 -mbulk-memory -o sudoku.wasm sudoku.c`

After compilation move `sudoku.wasm` file to src directory!
