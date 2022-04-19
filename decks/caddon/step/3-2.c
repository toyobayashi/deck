#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <Windows.h>
#include <winver.h>
#include <strsafe.h>

#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include "file_version_info.h"

struct fvi {
  uint16_t* file_name;
  void* block;
  VS_FIXEDFILEINFO *ffi;
  UINT ffi_size;
  translation_s* trans;
  UINT trans_size;
  WCHAR* lang_buf;
  DWORD lang_count;
};

typedef struct fvi fvi_s;