#include <cstddef>
#include <cstdlib>
#include <string>
#include <memory>
#include <iostream>

class File {
 private:
  FILE* f_;

 public:
  File(const char*,
       const char*) noexcept;
  ~File() noexcept;
  File(File&&) noexcept;
  File& operator=(File&&) noexcept;
  bool Ok() const noexcept { return f_ != nullptr; }
  std::string ReadToString() const;
};

File::~File() noexcept {
  if (Ok()) {
    int r = ::fclose(f_);
    if (r == 0) {
      f_ = nullptr;
    } else {
      std::cerr << "fclose failed\n";
      std::abort();
    }
  }
  std::cout << "~File()\n";
}

File::File(const char* path,
           const char* mode) noexcept:
  f_(::fopen(path, mode)) {}

File::File(File&& other) noexcept: f_(other.f_) {
  other.f_ = nullptr;
}

File& File::operator=(File&& other) noexcept {
  if (this != std::addressof(other)) {
    if (Ok()) {
      if (::fclose(f_)) {
        std::cerr << "fclose failed\n";
        std::abort();
      }
    }
    f_ = other.f_;
    other.f_ = nullptr;
  }
  return *this;
}

std::string File::ReadToString() const {
  ::fseek(f_, 0L, SEEK_END);
  size_t len = static_cast<size_t>(ftell(f_));
  ::fseek(f_, 0L, SEEK_SET);
  std::string s;
  s.resize(len);
  ::fread(&s[0], 1U, len, f_);
  return s;
}

int main() {
  {
    File f("CMakeLists.txt", "r");
    std::string data = f.ReadToString();
    std::cout << data << std::endl;
  }
  return 0;
}