(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (type (;1;) (func))
  (import "env" "memory" (memory (;0;) 0))
  (func (;0;) (type 1))
  (func (;1;) (type 0) (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add)
  (func (;2;) (type 0) (param i32 i32) (result i32)
    local.get 1
    i32.load
    local.get 0
    i32.load
    i32.add)
  (global (;0;) i32 (i32.const 0))
  (export "__wasm_call_ctors" (func 0))
  (export "__wasm_apply_data_relocs" (func 0))
  (export "add" (func 1))
  (export "add_address" (func 2))
  (export "__dso_handle" (global 0)))
