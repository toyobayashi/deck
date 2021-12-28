int pipe_stdout[2];
int pipe_stderr[2];

#define LOG_TAG "NODE_EXAMPLE"
void thread_stdout_func() {
  ssize_t redirect_size;
  std::string msg;
  char buf[1024];
  while ((redirect_size = read(pipe_stdout[0], buf, sizeof(buf) - 1)) > 0) {
    if (redirect_size == (sizeof(buf) - 1)) {
      buf[redirect_size] = 0;
      msg += buf;
    } else {
      if (buf[redirect_size - 1] == '\n') {
        --redirect_size;
      }
      buf[redirect_size] = 0;
      msg += buf;
      __android_log_write(ANDROID_LOG_INFO, LOG_TAG, msg.c_str());
      msg = "";
    }
  }
}

void thread_stderr_func() {
  ssize_t redirect_size;
  std::string msg;
  char buf[1024];
  while ((redirect_size = read(pipe_stderr[0], buf, sizeof(buf) - 1)) > 0) {
    if (redirect_size == (sizeof(buf) - 1)) {
      buf[redirect_size] = 0;
      msg += buf;
    } else {
      if (buf[redirect_size - 1] == '\n') {
        --redirect_size;
      }
      buf[redirect_size] = 0;
      msg += buf;
      __android_log_write(ANDROID_LOG_ERROR, LOG_TAG, msg.c_str());
      msg = "";
    }
  }
}

void start_redirecting_stdout_stderr() {
  setvbuf(stdout, 0, _IONBF, 0);
  pipe(pipe_stdout);
  dup2(pipe_stdout[1], STDOUT_FILENO);

  setvbuf(stderr, 0, _IONBF, 0);
  pipe(pipe_stderr);
  dup2(pipe_stderr[1], STDERR_FILENO);

  std::thread thread_stdout(thread_stdout_func);
  std::thread thread_stderr(thread_stderr_func);
  thread_stdout.detach();
  thread_stderr.detach();
}