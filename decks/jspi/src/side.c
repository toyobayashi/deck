#define WASM_IMPORT(mod, name) \
  __attribute__((import_module((mod)))) \
  __attribute__((import_name((name))))

#ifdef __EMSCRIPTEN__
#define WASM_EXPORT __attribute__((used))
#else
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

WASM_IMPORT("env", "logCString")
void log_c_string(const char* str);

WASM_EXPORT
int add(int a, int b) {
  return a + b;
}

WASM_EXPORT
int add_address(int* a, int* b) {
  return *a + *b;
}
