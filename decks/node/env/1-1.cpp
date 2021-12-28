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
};