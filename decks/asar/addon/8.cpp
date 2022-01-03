Napi::Value GetModuleObject(Napi::Env* env,
                            const Napi::Object& main_module,
                            const Napi::Object& this_exports) {
  Napi::Function find_function = env->RunScript(
    "(function findEntryModule(mainModule, exports) {"
      "function findModule(start, target) {"
        "if (start.exports === target) {"
          "return start;"
        "}"
        "for (var i = 0; i < start.children.length; i++) {"
          "var res = findModule(start.children[i], target);"
          "if (res) {"
            "return res;"
          "}"
        "}"
        "return null;"
      "}"
      "return findModule(mainModule, exports);"
    "});"
  ).As<Napi::Function>();
  Napi::Value res = find_function({ main_module, this_exports });
  if (res.IsNull()) {
    Napi::Error::New(*env, "Cannot find module object.")
      .ThrowAsJavaScriptException();
  }
  return res;
}

Napi::Function MakeRequireFunction(Napi::Env* env,
                                   const Napi::Object& mod) {
  Napi::Function make_require = env->RunScript(
    "(function makeRequireFunction(mod) {"
      "const Module = mod.constructor;"
      "function validateString (value, name) {"
        "if (typeof value !== 'string')"
          "throw new TypeError('The \"' + name + "
            "'\" argument must be of type string. Received type ' + "
            "typeof value);"
      "}"
      "const require = function require(path) {"
        "return mod.require(path);"
      "};"
      "function resolve(request, options) {"
        "validateString(request, 'request');"
        "return Module._resolveFilename(request, mod, false, options);"
      "}"
      "require.resolve = resolve;"
      "function paths(request) {"
        "validateString(request, 'request');"
        "return Module._resolveLookupPaths(request, mod);"
      "}"
      "resolve.paths = paths;"
      "require.main = process.mainModule;"
      "require.extensions = Module._extensions;"
      "require.cache = Module._cache;"
      "return require;"
    "});"
  ).As<Napi::Function>();
  return make_require({ mod }).As<Napi::Function>();
}

struct AddonData {
  std::unordered_map<int, Napi::FunctionReference> functions;
};

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

  AddonData* addon_data = env.GetInstanceData<AddonData>();

  if (addon_data == nullptr) {
    addon_data = new AddonData();
    env.SetInstanceData(addon_data);
  }

  Napi::Object module_prototype = module_constructor.Get("prototype")
    .As<Napi::Object>();
  // #define FN_MODULE_PROTOTYPE__COMPILE 0
  addon_data->functions[FN_MODULE_PROTOTYPE__COMPILE] =
    Napi::Persistent(module_prototype.Get("_compile").As<Napi::Function>());

  // Napi::Value ModulePrototypeCompile(const Napi::CallbackInfo& info);
  module_prototype.DefineProperty(
    Napi::PropertyDescriptor::Function(env,
      Napi::Object::New(env),
      "_compile",
      ModulePrototypeCompile,
      napi_enumerable,
      addon_data));
  
  try {
    require({ Napi::String::New(env, "./originalEntry.js") });
  } catch (const Napi::Error& e) {
    ShowErrorAndQuit(env, electron, e.Get("stack").As<Napi::String>());
  }
  return exports;
}

uint8_t* GetKeyVector() {
  static uint8_t key[32] = {
#include "key.txt"
  };

  return key;
}

Napi::String Decypt(const Napi::Env& env,
                    const Napi::String& base64) {
  Napi::Object buffer_constructor = env.Global().Get("Buffer")
    .As<Napi::Object>();
  Napi::Buffer<uint8_t> body = buffer_constructor.Get("from")
    .As<Napi::Function>()
    .Call(buffer_constructor, { base64, Napi::String::New(env, "base64") })
    .As<Napi::Buffer<uint8_t>>();

  // 前 16 位是 IV
  Napi::Buffer<uint8_t> iv = body.Get("slice").As<Napi::Function>()
    .Call(body, { Napi::Number::New(env, 0), Napi::Number::New(env, 16) })
    .As<Napi::Buffer<uint8_t>>();
  Napi::Buffer<uint8_t> data = body.Get("slice").As<Napi::Function>()
    .Call(body, { Napi::Number::New(env, 16) })
    .As<Napi::Buffer<uint8_t>>();

  // 内联 JS 脚本生成的 key 文件，tiny-AES-c 解密
  std::string plain_content = Aesdec(BufferToVector(data),
    GetKeyVector(), BufferToVector(iv));

  return Napi::String::New(env, plain_content);
}

Napi::Value ModulePrototypeCompile(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  AddonData* addon_data = static_cast<AddonData*>(info.Data());
  Napi::Object content = info[0].As<Napi::Object>();
  Napi::Object filename = info[1].As<Napi::Object>();
  Napi::Function old_compile =
    addon_data->functions[FN_MODULE_PROTOTYPE__COMPILE].Value();

  if (-1 != filename.Get("indexOf").As<Napi::Function>()
              .Call(filename, { Napi::String::New(env, "app.asar") })
              .As<Napi::Number>().Int32Value()) {
    return old_compile.Call(info.This(),
      { Decypt(env, content.As<Napi::String>()), filename });
  }
  return old_compile.Call(info.This(), { content, filename });
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)