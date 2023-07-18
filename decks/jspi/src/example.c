#define WASM_IMPORT(mod, name) \
  __attribute__((import_module((mod)))) \
  __attribute__((import_name((name))))

#define WASM_EXPORT __attribute__((visibility("default")))

WASM_IMPORT("env", "logCString")
void imported_env_log_c_string(const char* str);

WASM_IMPORT("env", "sleep")
void sleep(int ms);

WASM_EXPORT
int _start() {
  imported_env_log_c_string("_start begin");
  sleep(1000);
  imported_env_log_c_string("_start end");
  return 0;
}
