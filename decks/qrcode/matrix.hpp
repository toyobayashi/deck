#ifndef SRC_MATRIX_HPP_
#define SRC_MATRIX_HPP_

#include "napi.h"

namespace ZXing {

template <typename T>
class Matrix;

}

namespace zxingwasm {

class Matrix : public Napi::ObjectWrap<Matrix> {
 public:
  static void Init(Napi::Env env);
  explicit Matrix(const Napi::CallbackInfo& info);
  void Finalize(Napi::Env env);

 private:
  ZXing::Matrix<uint8_t>* value_;
  Napi::Value GetDataAddress(const Napi::CallbackInfo& info);
  Napi::Value GetDataSize(const Napi::CallbackInfo& info);
  Napi::Value GetWidth(const Napi::CallbackInfo& info);
  Napi::Value GetHeight(const Napi::CallbackInfo& info);
#ifndef __EMSCRIPTEN__
  Napi::Value GetBuffer(const Napi::CallbackInfo& info);
#endif
  Napi::Value Destroy(const Napi::CallbackInfo& info);
};

}  // namespace zxingwasm

#endif  // SRC_MATRIX_HPP_
