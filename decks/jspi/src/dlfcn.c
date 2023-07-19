#define WASM_IMPORT(mod, name) \
  __attribute__((import_module((mod)))) \
  __attribute__((import_name((name))))

#ifdef __EMSCRIPTEN__
#define WASM_EXPORT __attribute__((used))
#else
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

#include <stddef.h>

WASM_IMPORT("env", "log")
void js_log(int value);

WASM_IMPORT("dlfcn", "dlopen")
void* dlopen(const char *filename, int flag);

WASM_IMPORT("dlfcn", "dlsym")
void *dlsym(void *handle, const char *symbol);

WASM_EXPORT
int mul_address(int* a, int* b) {
  return (*a) * (*b);
}

WASM_EXPORT
int _start() {
  void* side = dlopen("side.wasm", 0);
  if (side == NULL) return 1;
  int (*add_address)(int*, int*) = dlsym(side, "add_address");
  if (add_address == NULL) return 2;
  int a = 5, b = 6;
  int r = add_address(&a, &b);
  js_log(r);

  int (*add)(int, int) = dlsym(side, "add");
  if (add == NULL) return 2;
  r = add(a, b);
  js_log(r);

  int (*mul)(int*, int*) = dlsym(NULL, "mul_address");
  if (mul == NULL) return 2;
  r = mul(&a, &b);
  js_log(r);
  return 0;
}
