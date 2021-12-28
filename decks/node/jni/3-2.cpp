extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_initialize(JNIEnv *env, jclass clazz) {
  start_redirecting_stdout_stderr();
  return NodeInstance::Initialize();
}

extern "C" JNIEXPORT void JNICALL
Java_package_NodeJs_shutdown(JNIEnv *env, jclass clazz) {
  NodeInstance::Shutdown();
}

extern "C" JNIEXPORT jlong JNICALL
Java_package_NodeJs_createInstance(JNIEnv* env, jclass clazz) {
  std::string err;
  NodeJs* p = NodeJs::Create(&err, env);
  if (p == nullptr) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), err.c_str());
    return 0L;
  }
  return reinterpret_cast<jlong>(p);
}

extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_dispose(JNIEnv* env, jobject instance) {
  jclass Clazz = env->GetObjectClass(instance);
  auto fid = env->GetFieldID(Clazz, "nativePointer", "J");
  NodeJs* p = reinterpret_cast<NodeJs*>(env->GetLongField(instance, fid));
  jint exit_code = 0;
  if (p != nullptr) {
    exit_code = p->Dispose();
    delete p;
  }
  env->SetLongField(instance, fid, 0L);
  return exit_code;
}
