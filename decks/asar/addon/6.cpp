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
  Napi::Object process = env.Global().Get("process").As<Napi::Object>();
  Napi::Array argv = process.Get("argv").As<Napi::Array>();
  for (uint32_t i = 0; i < argv.Length(); ++i) {
    std::string arg = argv.Get(i).As<Napi::String>().Utf8Value();
    if (arg.find("--inspect") == 0 ||
        arg.find("--remote-debugging-port") == 0) {
      Napi::Error::New(env, "Not allow debugging this program.")
        .ThrowAsJavaScriptException();
      return exports;
    }
  }
  Napi::Object main_module = process.Get("mainModule").As<Napi::Object>();

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
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)