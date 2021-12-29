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

inline NodeJs* GetNodeInstance(JNIEnv* env, jobject instance) {
  jclass Clazz = env->GetObjectClass(instance);
  NodeJs* p = reinterpret_cast<NodeJs*>(env->GetLongField(
      instance, env->GetFieldID(Clazz, "nativePointer", "J")));
  if (p == nullptr) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), "bad node instance");
  }
  return p;
}

extern "C" JNIEXPORT void JNICALL
Java_package_NodeJs_evalVoid(JNIEnv* env,
                             jobject instance,
                             jstring script) {
  std::string errmsg;
  const char* scriptString = env->GetStringUTFChars(script, JNI_FALSE);
  NodeJs* p = GetNodeInstance(env, instance);
  if (!p)
    return;
  int r = p->Eval(scriptString, NodeJs::EvalCallback{}, nullptr, &errmsg);
  env->ReleaseStringUTFChars(script, scriptString);
  if (r != 0) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), errmsg.c_str());
  }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_package_NodeJs_evalBool(JNIEnv* env,
                             jobject instance,
                             jstring script) {
  std::string errmsg;
  uint8_t result = 0;
  const char* scriptString = env->GetStringUTFChars(script, JNI_FALSE);
  NodeJs* p = GetNodeInstance(env, instance);
  if (!p)
    return 0;
  int r = p->Eval(
      scriptString,
      [](const v8::Local<v8::Context>& context,
         const v8::Local<v8::Value>& value, void* data) {
        if (data != nullptr && value->IsBoolean()) {
          *static_cast<uint8_t*>(data) =
              value->BooleanValue(context->GetIsolate());
        }
      },
      &result, &errmsg);
  env->ReleaseStringUTFChars(script, scriptString);
  if (r != 0) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), errmsg.c_str());
    return 0;
  }
  return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_package_NodeJs_evalInt(JNIEnv* env,
                            jobject instance,
                            jstring script) {
  std::string errmsg;
  int32_t result = 0;
  const char* scriptString = env->GetStringUTFChars(script, JNI_FALSE);
  NodeJs* p = GetNodeInstance(env, instance);
  if (!p)
    return 0;
  int r = p->Eval(
      scriptString,
      [](const v8::Local<v8::Context>& context,
         const v8::Local<v8::Value>& value, void* data) {
        if (data != nullptr && value->IsNumber()) {
          *static_cast<int32_t*>(data) = value->Int32Value(context).ToChecked();
        }
      },
      &result, &errmsg);
  env->ReleaseStringUTFChars(script, scriptString);
  if (r != 0) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), errmsg.c_str());
    return 0;
  }
  return result;
}

extern "C" JNIEXPORT jdouble JNICALL
Java_package_NodeJs_evalDouble(JNIEnv* env,
                               jobject instance,
                               jstring script) {
  std::string errmsg;
  double result = 0;
  const char* scriptString = env->GetStringUTFChars(script, JNI_FALSE);
  NodeJs* p = GetNodeInstance(env, instance);
  if (!p)
    return 0;
  int r = p->Eval(
      scriptString,
      [](const v8::Local<v8::Context>& context,
         const v8::Local<v8::Value>& value, void* data) {
        if (data != nullptr && value->IsNumber()) {
          *static_cast<double*>(data) = value->NumberValue(context).ToChecked();
        }
      },
      &result, &errmsg);
  env->ReleaseStringUTFChars(script, scriptString);
  if (r != 0) {
    env->ThrowNew(env->FindClass("java/lang/Exception"), errmsg.c_str());
    return 0;
  }
  return result;
}