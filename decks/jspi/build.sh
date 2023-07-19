#/usr/bin/bash

set -e

wat2wasm --enable-all ./src/example1.wat -o ./src/example1.wasm

$EMSDK/upstream/bin/clang -O3 -o ./src/example1_c.wasm --target=wasm32-unknown-unknown -nostdlib ./src/example.c -Wl,--import-undefined,--export-dynamic,--no-entry
wasm2wat -o ./src/example1_c.wat ./src/example1_c.wasm

wat2wasm --enable-all ./src/example2.wat -o ./src/example2.wasm

$EMSDK/upstream/bin/clang -O3 -o ./src/example2_c.wasm --target=wasm32-unknown-unknown -nostdlib ./src/example.c -Wl,--import-undefined,--export-dynamic,--no-entry
wasm-opt -O3 --enable-reference-types --jspi --pass-arg=jspi-imports@env.sleep --pass-arg=jspi-exports@_start -o ./src/example2_c.wasm ./src/example2_c.wasm
wasm2wat -o ./src/example2_c.wat ./src/example2_c.wasm

$EMSDK/upstream/bin/clang -fPIC -O3 -o ./src/side.wasm --target=wasm32-unknown-unknown -nostdlib ./src/side.c -Wl,--import-undefined,--export-dynamic,--export-all,--no-entry,--import-memory,--import-table,-shared
wasm2wat -o ./src/side.wat ./src/side.wasm

$EMSDK/upstream/bin/clang -fPIC -O3 -o ./src/dlfcn.wasm --target=wasm32-unknown-unknown -nostdlib ./src/dlfcn.c -Wl,--import-undefined,--export-dynamic,--no-entry,--import-memory,--import-table,-pie
wasm-opt -O3 --enable-reference-types --jspi --pass-arg=jspi-imports@dlfcn.dlopen --pass-arg=jspi-exports@_start -o ./src/dlfcn.wasm ./src/dlfcn.wasm
wasm2wat -o ./src/dlfcn.wat ./src/dlfcn.wasm
