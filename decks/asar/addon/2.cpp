Napi::Object Init(Napi::Env env, Napi::Object exports) {
  Napi::Object main_module = env.Global().Get("process").As<Napi::Object>()
    .Get("mainModule").As<Napi::Object>();

  Napi::Object this_module = GetModuleObject(&env, main_module, exports)
    .As<Napi::Object>();

  Napi::Function require = MakeRequireFunction(&env, this_module);

  Napi::Object electron = require({ Napi::String::New(env, "electron") })
    .As<Napi::Object>();
  Napi::Object module_constructor = require({
    Napi::String::New(env, "module") }).As<Napi::Object>();

  Napi::Value module_parent = this_module.Get("parent");
  if (this_module != main_module || (
    module_parent != module_constructor &&
    module_parent != env.Undefined() &&
    module_parent != env.Null())) {
    ShowErrorAndQuit(env, electron, Napi::String::New(env, errmsg));
    return exports;
  }
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)