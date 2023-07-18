(module
  (import "env" "logCString" (func $imported_env_log_c_string (param i32)))
  (import "env" "sleep" (func $imported_env_sleep (param externref) (param i32)))
  ;; (import "env" "suspender" (global $suspender (mut externref)))
  (global $suspender (mut externref) (ref.null extern))
  (memory (export "memory") 1)
  (data (i32.const 0) "_start begin\00")
  (data (i32.const 13) "_start end\00")
  (func $sleep (param $ms i32)
    (local $current_suspender externref)
    (local.tee $current_suspender (global.get $suspender))
    local.get $ms
    call $imported_env_sleep
    (global.set $suspender (local.get $current_suspender))
  )
  (func $_start (export "_start") (param externref) (result i32)
    (global.set $suspender (local.get 0))
    (call $imported_env_log_c_string (i32.const 0))
    (call $sleep (i32.const 1000))
    (call $imported_env_log_c_string (i32.const 13))
    i32.const 0
  )
)
