char* NodeJs::argv[2] = { "node", nullptr };

std::unique_ptr<node::MultiIsolatePlatform>
NodeJs::platform(nullptr);

int NodeJs::Initialize() {
  std::vector<std::string> args(argv, argv + 1);
  std::vector<std::string> exec_args;
  uv_setup_args(1, argv);
  std::vector<std::string> errors;
  int exit_code = node::InitializeNodeWithArgs(
    &args, &exec_args, &errors);
  for (const std::string& error : errors)
    fprintf(stderr, "%s: %s\n", args[0].c_str(), error.c_str());
  if (exit_code != 0) {
    return exit_code;
  }

  platform = node::MultiIsolatePlatform::Create(4);
  v8::V8::InitializePlatform(platform.get());
  v8::V8::Initialize();
  return 0;
}

void NodeJs::Shutdown() {
  v8::V8::Dispose();
  v8::V8::ShutdownPlatform();
  platform.reset();
}

NodeJs::NodeJs() noexcept:
  exit_(0),
  setup_(nullptr),
  args_({ "node" }),
  exec_args_() {
  std::vector<std::string> errors;
  setup_ = node_embed_helpers::CommonEnvironmentSetup::Create(
    platform.get(), &errors, args_, exec_args_).release();
  if (!errors.empty()) {
    abort();
  }
}

NodeJs::NodeJs(std::vector<std::string> args,
               std::vector<std::string> exec_args,
               void* priv) noexcept:
  exit_(0),
  priv_(priv),
  setup_(nullptr),
  args_(std::move(args)),
  exec_args_(std::move(exec_args)) {
  std::vector<std::string> errors;
  setup_ = node_embed_helpers::CommonEnvironmentSetup::Create(
    platform.get(), &errors, args_, exec_args_).release();
  if (!errors.empty()) {
    abort();
  }
}

void NodeJs::SpinEventLoop() {
  v8::Isolate* isolate = setup_->isolate();
  v8::SealHandleScope seal(isolate);
  uv_loop_t* loop = setup_->event_loop();
  node::Environment* env = setup_->env();
  node::MultiIsolatePlatform* isolate_platform =
    node::GetMultiIsolatePlatform(env);
  bool more;
  do {
    uv_run(loop, UV_RUN_DEFAULT);

    isolate_platform->DrainTasks(isolate);
    more = uv_loop_alive(loop);
    if (more) continue;
  } while (more && exit_ == 0);
}

int NodeJs::Dispose() {
  if (setup_ == nullptr) {
    return exit_;
  }
  v8::Isolate* isolate = setup_->isolate();
  node::Environment* env = setup_->env();
  if (exit_ == 0) {
    v8::Locker locker(isolate);
    v8::Isolate::Scope isolate_scope(isolate);

    node::EmitBeforeExit(env);
    this->SpinEventLoop();
    exit_ = node::EmitExit(env);
    node::Stop(env);
  }
  delete setup_;
  setup_ = nullptr;
  return exit_;
}

NodeJs::~NodeJs() {
  this->Dispose();
}

void* NodeJs::Data() const noexcept {
  return priv_;
}

NodeJs* NodeJs::Create(std::string* err, void* priv) {
  return Create({ "node" }, {}, err, priv);
}

NodeJs* NodeJs::Create(const std::vector<std::string>& args,
                       const std::vector<std::string>& exec_args,
                       std::string* err,
                       void* priv) {
  std::unique_ptr<NodeJs> node_instance(new NodeJs(args, exec_args, priv));

  v8::Isolate* isolate = node_instance->setup_->isolate();
  v8::Locker locker(isolate);
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = node_instance->setup_->context();
  v8::Context::Scope context_scope(context);
  node::Environment* env = node_instance->setup_->env();

  node::AddLinkedBinding(env, "android", Init, priv);

  v8::TryCatch trycatch(isolate);
  v8::MaybeLocal<v8::Value> loadenv_ret;
  if (args.size() > 1) {

  } else {
    loadenv_ret = node::LoadEnvironment(env,
      "(function () {"
        "const androidLoge = process._linkedBinding('android').androidLoge;"
        "process.on('uncaughtException', (err) => {"
        "  androidLoge('Uncaught ' + err);"
        "});"
        "const cwd = process.cwd();"
        "const trailingSlash = cwd.endsWith('/') ||"
        "  (process.platform === 'win32' && cwd.endsWith('\\\\'));"
        "globalThis.require = require('module').createRequire("
        "  trailingSlash ? cwd : (cwd + '/'));"
      "})();");
    if (loadenv_ret.IsEmpty()) {
      if (trycatch.HasCaught()) {
        OnUncaughtException(
          node_instance.get(), trycatch.Exception(), false, err);
      }
      return nullptr;
    }
  }
  return node_instance.release();
}