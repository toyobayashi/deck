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

CommonEnvironmentSetup::CommonEnvironmentSetup(
    node::MultiIsolatePlatform* platform,
    std::vector<std::string>* errors,
    const std::function<node::Environment*(const CommonEnvironmentSetup*)>& make_env)
  : impl_(new Impl()) {
  if (platform == nullptr) abort();
  if (errors == nullptr) abort();

  impl_->platform = platform;
  uv_loop_t* loop = &impl_->loop;

  loop->data = nullptr;
  int ret = uv_loop_init(loop);
  if (ret != 0) {
    errors->push_back(std::string("Failed to initialize loop: ") + uv_err_name(ret));
    return;
  }
  loop->data = this;

  impl_->allocator = node::ArrayBufferAllocator::Create();
  impl_->isolate = node::NewIsolate(impl_->allocator, &impl_->loop, platform);
  v8::Isolate* isolate = impl_->isolate;

  {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);
    impl_->isolate_data.reset(node::CreateIsolateData(
        isolate, loop, platform, impl_->allocator.get()));

    v8::HandleScope handle_scope(isolate);
    v8::Local<v8::Context> context = node::NewContext(isolate);
    impl_->context.Reset(isolate, context);
    if (context.IsEmpty()) {
      errors->push_back("Failed to initialize V8 Context");
      return;
    }

    v8::Context::Scope context_scope(context);
    impl_->env.reset(make_env(this));
  }
}