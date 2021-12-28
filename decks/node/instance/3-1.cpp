class NodeJs final {
 private:
  int exit_;
  void* priv_;
  node_embed_helpers::CommonEnvironmentSetup* setup_;
  std::vector<std::string> args_;
  std::vector<std::string> exec_args_;
  NodeJs() noexcept;
  NodeJs(std::vector<std::string> args,
         std::vector<std::string> exec_args,
         void* priv = nullptr) noexcept;

  static char* argv[2];
  static std::unique_ptr<
    node::MultiIsolatePlatform> platform;
 public:
  static int Initialize();
  static void Shutdown();

  NodeJs(const NodeJs&) = delete;
  NodeJs& operator=(const NodeJs&) = delete;
  NodeJs(NodeJs&&) = delete;
  NodeJs& operator=(NodeJs&&) = delete;

  void SpinEventLoop();
};