extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_initialize(JNIEnv *env, jclass clazz) {
  start_redirecting_stdout_stderr();
  return NodeJs::Initialize();
}

extern "C" JNIEXPORT void JNICALL
Java_package_NodeJs_shutdown(JNIEnv *env, jclass clazz) {
  NodeJs::Shutdown();
}