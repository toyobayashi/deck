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