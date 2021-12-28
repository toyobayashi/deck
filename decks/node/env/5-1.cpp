#include <memory>
#include <vector>
#include <string>
#include <functional>
#include "node.h"
#include "uv.h"

class CommonEnvironmentSetup final {
 public:
  ~CommonEnvironmentSetup();

  CommonEnvironmentSetup(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup& operator=(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup(CommonEnvironmentSetup&&) = delete;
  CommonEnvironmentSetup& operator=(CommonEnvironmentSetup&&) = delete;

  struct uv_loop_s* event_loop() const;
  std::shared_ptr<node::ArrayBufferAllocator> array_buffer_allocator() const;
  v8::Isolate* isolate() const;
  node::IsolateData* isolate_data() const;
  node::Environment* env() const;
  v8::Local<v8::Context> context() const;

 private:
  struct Impl;
  Impl* impl_;
  CommonEnvironmentSetup(
      node::MultiIsolatePlatform*,
      std::vector<std::string>*,
      const std::function<node::Environment*(const CommonEnvironmentSetup*)>&);
};