#include <cstdlib>
#include <cstdio>
#include "env.hpp"

template <typename T, void (*function)(T*)>
using DeleteFnPtr = typename FunctionDeleter<T, function>::Pointer;

struct CommonEnvironmentSetup::Impl {
  node::MultiIsolatePlatform* platform;
  uv_loop_t loop;
  std::shared_ptr<node::ArrayBufferAllocator> allocator;
  v8::Isolate* isolate;
  DeleteFnPtr<node::IsolateData, node::FreeIsolateData> isolate_data;
  DeleteFnPtr<node::Environment, node::FreeEnvironment> env;
  v8::Global<v8::Context> context;
  Impl() noexcept;
};

CommonEnvironmentSetup::Impl::Impl() noexcept:
  platform(nullptr),
  loop(),
  allocator(nullptr),
  isolate(nullptr),
  isolate_data(nullptr),
  env(nullptr),
  context() {}