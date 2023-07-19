(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (type (;1;) (func (param i32)))
  (type (;2;) (func))
  (type (;3;) (func (result i32)))
  (type (;4;) (func (param externref) (result i32)))
  (type (;5;) (func (param externref i32 i32) (result i32)))
  (import "dlfcn" "dlsym" (func (;0;) (type 0)))
  (import "env" "log" (func (;1;) (type 1)))
  (import "dlfcn" "dlopen" (func (;2;) (type 5)))
  (import "env" "__stack_pointer" (global (;0;) (mut i32)))
  (import "env" "__memory_base" (global (;1;) i32))
  (import "env" "memory" (memory (;0;) 1))
  (import "env" "__indirect_function_table" (table (;0;) 0 funcref))
  (func (;3;) (type 2)
    nop)
  (func (;4;) (type 0) (param i32 i32) (result i32)
    local.get 1
    i32.load
    local.get 0
    i32.load
    i32.mul)
  (func (;5;) (type 3) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 0
    global.set 0
    block  ;; label = @1
      global.get 1
      i32.const 24
      i32.add
      i32.const 0
      call 7
      local.tee 1
      i32.eqz
      if  ;; label = @2
        i32.const 1
        local.set 2
        br 1 (;@1;)
      end
      local.get 1
      global.get 1
      i32.const 12
      i32.add
      call 0
      local.tee 2
      i32.eqz
      if  ;; label = @2
        i32.const 2
        local.set 2
        br 1 (;@1;)
      end
      local.get 0
      i32.const 5
      i32.store offset=12
      local.get 0
      i32.const 6
      i32.store offset=8
      local.get 0
      i32.const 12
      i32.add
      local.get 0
      i32.const 8
      i32.add
      local.get 2
      call_indirect (type 0)
      call 1
      i32.const 2
      local.set 2
      local.get 1
      global.get 1
      i32.const 34
      i32.add
      call 0
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=12
      local.get 0
      i32.load offset=8
      local.get 1
      call_indirect (type 0)
      call 1
      i32.const 0
      global.get 1
      call 0
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 12
      i32.add
      local.get 0
      i32.const 8
      i32.add
      local.get 1
      call_indirect (type 0)
      call 1
      i32.const 0
      local.set 2
    end
    local.get 0
    i32.const 16
    i32.add
    global.set 0
    local.get 2)
  (func (;6;) (type 4) (param externref) (result i32)
    local.get 0
    global.set 2
    call 5)
  (func (;7;) (type 0) (param i32 i32) (result i32)
    (local externref i32)
    global.get 2
    local.set 2
    global.get 2
    local.get 0
    local.get 1
    call 2
    local.set 3
    local.get 2
    global.set 2
    local.get 3)
  (global (;2;) (mut externref) (ref.null extern))
  (export "__wasm_apply_data_relocs" (func 3))
  (export "mul_address" (func 4))
  (export "_start" (func 6))
  (data (;0;) (global.get 1) "mul_address\00add_address\00side.wasm\00add\00"))
