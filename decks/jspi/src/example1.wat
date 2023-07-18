(module
  (import "env" "logCString" (func $imported_env_log_c_string (param i32)))
  (import "env" "sleep" (func $imported_env_sleep (param i32)))
  (memory (export "memory") 1)
  (data (i32.const 0) "_start begin\00")
  (data (i32.const 13) "_start end\00")
  (func $_start (export "_start") (result i32)
    (call $imported_env_log_c_string (i32.const 0))
    (call $imported_env_sleep (i32.const 1000))
    (call $imported_env_log_c_string (i32.const 13))
    i32.const 0
  )
)
