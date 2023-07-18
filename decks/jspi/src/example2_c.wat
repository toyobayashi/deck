(module
  (type (;0;) (func (param i32)))
  (type (;1;) (func (result i32)))
  (type (;2;) (func (param externref) (result i32)))
  (type (;3;) (func (param externref i32)))
  (import "env" "logCString" (func (;0;) (type 0)))
  (import "env" "sleep" (func (;1;) (type 3)))
  (func (;2;) (type 1) (result i32)
    i32.const 1024
    call 0
    i32.const 1000
    call 4
    i32.const 1037
    call 0
    i32.const 0)
  (func (;3;) (type 2) (param externref) (result i32)
    local.get 0
    global.set 0
    call 2)
  (func (;4;) (type 0) (param i32)
    (local externref)
    global.get 0
    local.set 1
    global.get 0
    local.get 0
    call 1
    local.get 1
    global.set 0)
  (memory (;0;) 2)
  (global (;0;) (mut externref) (ref.null extern))
  (export "memory" (memory 0))
  (export "_start" (func 3))
  (data (;0;) (i32.const 1024) "_start begin\00_start end"))
