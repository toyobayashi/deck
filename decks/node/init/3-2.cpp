class NodeJs final {
 private:
  static char* argv[2];
  static std::unique_ptr<
    node::MultiIsolatePlatform> platform;
 public:
  static int Initialize();
  static void Shutdown();
};