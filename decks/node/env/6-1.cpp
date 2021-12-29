#include <memory>
#include <vector>
#include <string>
#include <functional>
#include "node.h"
#include "uv.h"

namespace node_embed_helpers {

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

  template <typename... EnvironmentArgs>
  static std::unique_ptr<CommonEnvironmentSetup> Create(
      node::MultiIsolatePlatform* platform,
      std::vector<std::string>* errors,
      EnvironmentArgs&&... env_args);

 private:
  struct Impl;
  Impl* impl_;
  CommonEnvironmentSetup(
      node::MultiIsolatePlatform*,
      std::vector<std::string>*,
      const std::function<node::Environment*(const CommonEnvironmentSetup*)>&);
};

template <typename... EnvironmentArgs>
std::unique_ptr<CommonEnvironmentSetup> CommonEnvironmentSetup::Create(
    node::MultiIsolatePlatform* platform,
    std::vector<std::string>* errors,
    EnvironmentArgs&&... env_args) {
  auto ret = std::unique_ptr<CommonEnvironmentSetup>(new CommonEnvironmentSetup(
      platform, errors,
      [&](const CommonEnvironmentSetup* setup) -> node::Environment* {
        return node::CreateEnvironment(
            setup->isolate_data(), setup->context(),
            std::forward<EnvironmentArgs>(env_args)...);
      }));
  if (!errors->empty()) ret.reset();
  return ret;
}

}  // node_embed_helpers