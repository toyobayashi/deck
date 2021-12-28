int pipe_stdout[2];
int pipe_stderr[2];

void start_redirecting_stdout_stderr() {
  setvbuf(stdout, 0, _IONBF, 0);
  pipe(pipe_stdout);
  dup2(pipe_stdout[1], STDOUT_FILENO);

  setvbuf(stderr, 0, _IONBF, 0);
  pipe(pipe_stderr);
  dup2(pipe_stderr[1], STDERR_FILENO);
}