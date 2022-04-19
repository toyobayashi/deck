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

static const char* errmsgs[] = {
  "",
  "Invalid fvi_t",
  "Invalid argument",
  "VS_FIXEDFILEINFO is NULL",
  "translation_s is NULL",
  "Windows API Error",
  "Unsupported platform",
};

const char* fvi_err(fvi_result code) {
  return errmsgs[code];
}

fvi_t fvi_init(const uint16_t* file_name) {
  fvi_t info =
    (fvi_t) malloc(sizeof(fvi_s));
  if (info == NULL) return NULL;
  ZeroMemory(info, sizeof(fvi_s));

  HRESULT hr;
  size_t len = 0;
  hr = StringCchLengthW(file_name, STRSAFE_MAX_CCH, &len);
  if (FAILED(hr)) {
    return info;
  }
  uint16_t* copied_file_name =
    (uint16_t*) malloc(sizeof(uint16_t) * (len + 1));
  if (copied_file_name == NULL) {
    return info;
  }
  hr = StringCchCopyW(copied_file_name, len + 1, file_name);
  if (FAILED(hr)) {
    free(copied_file_name);
    return info;
  }
  info->file_name = copied_file_name;

  DWORD handle;
  DWORD datasize = GetFileVersionInfoSizeW(
    (LPCWSTR) file_name, &handle);

  if (datasize <= 0) return info;

  void* block = malloc(datasize);
  if (!block) return info;

  if (!GetFileVersionInfoW(file_name, handle, datasize, block)) {
    free(block);
    return info;
  }
  info->block = block;

  VS_FIXEDFILEINFO *ffi = NULL;
  UINT ffi_size = 0;
  VerQueryValueW(block, L"\\", (LPVOID*) &ffi, &ffi_size);
  info->ffi = ffi;
  info->ffi_size = ffi_size;

  translation_s* trans = NULL;
  UINT trans_size = 0;
  VerQueryValueW(block, L"\\VarFileInfo\\Translation",
    (LPVOID*) &trans, &trans_size);
  info->trans = trans;
  info->trans_size = trans_size;

  DWORD lang_count = 0;
  WCHAR* lang_buf = (WCHAR*) malloc(128 * sizeof(WCHAR));
  ZeroMemory(lang_buf, 128 * sizeof(WCHAR));
  if (lang_buf == NULL) {
    return info;
  }
  if (trans == NULL) {
    lang_count = VerLanguageNameW(0x0409, lang_buf, 128);
  } else {
    if (trans_size >= 1) {
      uint32_t lang = ((*trans).wLanguage) |
                      ((*trans).wCodePage << 16);
      lang_count = VerLanguageNameW(lang & 0xFFFF, lang_buf, 128);
    }
  }
  info->lang_buf = lang_buf;
  info->lang_count = lang_count;

  return info;
}