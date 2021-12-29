#include <memory>
#include <vector>
#include <string>
#include <functional>
#include "node.h"
#include "uv.h"

namespace node_embed_helpers {

class CommonEnvironmentSetup final {
 public:
  CommonEnvironmentSetup(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup& operator=(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup(CommonEnvironmentSetup&&) = delete;
  CommonEnvironmentSetup& operator=(CommonEnvironmentSetup&&) = delete;

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