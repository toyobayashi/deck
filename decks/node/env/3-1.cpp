#include <memory>
#include <vector>
#include <string>
#include <functional>
#include "node.h"
#include "uv.h"

class CommonEnvironmentSetup final {
 public:
  CommonEnvironmentSetup(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup& operator=(const CommonEnvironmentSetup&) = delete;
  CommonEnvironmentSetup(CommonEnvironmentSetup&&) = delete;
  CommonEnvironmentSetup& operator=(CommonEnvironmentSetup&&) = delete;

 private:
  struct Impl;
  Impl* impl_;
  CommonEnvironmentSetup(
      node::MultiIsolatePlatform*,
      std::vector<std::string>*,
      const std::function<node::Environment*(const CommonEnvironmentSetup*)>&);
};