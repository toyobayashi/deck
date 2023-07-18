(module
  (type (;0;) (func (param i32)))
  (type (;1;) (func (result i32)))
  (import "env" "logCString" (func (;0;) (type 0)))
  (import "env" "sleep" (func (;1;) (type 0)))
  (func (;2;) (type 1) (result i32)
    i32.const 1024
    call 0
    i32.const 1000
    call 1
    i32.const 1037
    call 0
    i32.const 0)
  (memory (;0;) 2)
  (export "memory" (memory 0))
  (export "_start" (func 2))
  (data (;0;) (i32.const 1024) "_start begin\00_start end"))
