jobject GetGlobalContext(JNIEnv* env) {
  jclass activityThread = env->FindClass("android/app/ActivityThread");
  jmethodID currentActivityThread = env->GetStaticMethodID(
    activityThread, "currentActivityThread", "()Landroid/app/ActivityThread;");
  jobject at = env->CallStaticObjectMethod(activityThread, currentActivityThread);

  jmethodID getApplication = env->GetMethodID(
    activityThread, "getApplication", "()Landroid/app/Application;");
  jobject context = env->CallObjectMethod(at, getApplication);
  return context;
}

void toast(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();

  if (args.Length() < 1) {
    isolate->ThrowException(v8::Exception::TypeError(
        v8::String::NewFromUtf8(isolate, "missing message")
          .ToLocalChecked()));
    return;
  }

  if (!args[0]->IsString()) {
    isolate->ThrowException(v8::Exception::TypeError(
        v8::String::NewFromUtf8(isolate, "message is not a string")
          .ToLocalChecked()));
    return;
  }

  v8::Local<v8::External> env_external = args.Data().As<v8::External>();
  JNIEnv* env = static_cast<JNIEnv*>(env_external->Value());
  jclass Toast = env->FindClass("android/widget/Toast");
  jmethodID show = env->GetMethodID(Toast, "show", "()V");

  jmethodID makeText = env->GetStaticMethodID(Toast,
    "makeText",
    "(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;");
  jobject toastObject = env->CallStaticObjectMethod(
    Toast, makeText, GetGlobalContext(env),
    env->NewStringUTF(*v8::String::Utf8Value(isolate, args[0])), 0);
  env->CallVoidMethod(toastObject, show);
  args.GetReturnValue().Set(v8::Undefined(isolate));
}

void logd(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  if (args.Length() < 1) {
    isolate->ThrowException(v8::Exception::TypeError(
        v8::String::NewFromUtf8(isolate, "missing message").ToLocalChecked()));
    return;
  }

  v8::String::Utf8Value str(isolate, args[0]);
  __android_log_write(ANDROID_LOG_INFO, LOG_TAG, *str);
  args.GetReturnValue().Set(v8::Undefined(isolate));
}

void loge(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  if (args.Length() < 1) {
    isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "missing message").ToLocalChecked()));
    return;
  }

  v8::String::Utf8Value str(isolate, args[0]);
  __android_log_write(ANDROID_LOG_ERROR, LOG_TAG, *str);
  args.GetReturnValue().Set(v8::Undefined(isolate));
}

void Init(
  v8::Local<v8::Object> exports,
  v8::Local<v8::Value> /* module */,
  v8::Local<v8::Context> context,
  void* env
) {
  v8::Isolate* isolate = context->GetIsolate();

  v8::Local<v8::FunctionTemplate> toastTemplate =
    v8::FunctionTemplate::New(isolate, toast, v8::External::New(isolate, env));
  v8::Local<v8::Function> toastFunction = toastTemplate->GetFunction(context)
    .ToLocalChecked();
  v8::Local<v8::String> toastName = v8::String::NewFromUtf8(isolate, "toast")
    .ToLocalChecked();
  toastFunction->SetName(toastName);
  exports->Set(context, toastName, toastFunction).Check();

  v8::Local<v8::FunctionTemplate> logTemplate =
    v8::FunctionTemplate::New(isolate, logd);
  v8::Local<v8::Function> logFunction = logTemplate->GetFunction(context)
    .ToLocalChecked();
  v8::Local<v8::String> logName = v8::String::NewFromUtf8(isolate, "androidLogd")
    .ToLocalChecked();
  logFunction->SetName(logName);
  exports->Set(context, logName, logFunction).Check();

  v8::Local<v8::FunctionTemplate> logeTemplate =
    v8::FunctionTemplate::New(isolate, loge);
  v8::Local<v8::Function> logeFunction = logeTemplate->GetFunction(context)
    .ToLocalChecked();
  v8::Local<v8::String> logeName = v8::String::NewFromUtf8(isolate, "androidLoge")
    .ToLocalChecked();
  logeFunction->SetName(logeName);
  exports->Set(context, logeName, logeFunction).Check();
}