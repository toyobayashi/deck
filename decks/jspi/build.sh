#/usr/bin/bash

set -e

wat2wasm --enable-all ./src/example1.wat -o ./src/example1.wasm

$WASI_SDK_PATH/bin/clang -O3 -o ./src/example1_c.wasm --target=wasm32-unknown-unknown -nostdlib ./src/example.c -Wl,--import-undefined,--export-dynamic,--no-entry
wasm2wat -o ./src/example1_c.wat ./src/example1_c.wasm

wat2wasm --enable-all ./src/example2.wat -o ./src/example2.wasm

$WASI_SDK_PATH/bin/clang -O3 -o ./src/example2_c.wasm --target=wasm32-unknown-unknown -nostdlib ./src/example.c -Wl,--import-undefined,--export-dynamic,--no-entry
wasm-opt -O3 --enable-reference-types --jspi --pass-arg=jspi-imports@env.sleep --pass-arg=jspi-exports@_start -o ./src/example2_c.wasm ./src/example2_c.wasm
wasm2wat -o ./src/example2_c.wat ./src/example2_c.wasm
