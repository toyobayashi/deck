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
}