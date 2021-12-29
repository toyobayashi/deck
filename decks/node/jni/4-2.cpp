extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_initialize(JNIEnv *env, jclass clazz) {
  start_redirecting_stdout_stderr();
  return NodeJs::Initialize();
}

extern "C" JNIEXPORT void JNICALL
Java_package_NodeJs_shutdown(JNIEnv *env, jclass clazz) {
  NodeJs::Shutdown();
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

extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_runMain(JNIEnv* env,
                            jclass clazz,
                            jstring path,
                            jobjectArray args) {
  const char* pathString = env->GetStringUTFChars(path, JNI_FALSE);
  std::string entry_path(pathString);
  env->ReleaseStringUTFChars(path, pathString);
  std::string err;
  std::vector<std::string> arglist;
  jsize len = env->GetArrayLength(args);
  arglist.reserve(len);
  for (jsize i = 0; i < len; ++i) {
    auto strarg =
        reinterpret_cast<jstring>(env->GetObjectArrayElement(args, i));
    const char* cstr = env->GetStringUTFChars(strarg, JNI_FALSE);
    arglist.emplace_back(cstr);
    env->ReleaseStringUTFChars(strarg, cstr);
  }
  int code = 0;
  if (!NodeJs::RunMain(entry_path, arglist, &code, &err)) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), err.c_str());
  }
  return code;
}
