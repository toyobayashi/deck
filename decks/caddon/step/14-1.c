// file_version_info.h
#ifndef SRC_FILE_VERSION_INFO_H_
#define SRC_FILE_VERSION_INFO_H_

#ifdef FVI_BUILD_DLL
  #ifdef __GNUC__
    #define _FVI_EXPORT __attribute__((dllexport))
  #else
    #define _FVI_EXPORT __declspec(dllexport)
  #endif
#else
  #ifdef FVI_USE_DLL
    #ifdef __GNUC__
      #define _FVI_EXPORT __attribute__((dllimport))
    #else
      #define _FVI_EXPORT __declspec(dllimport)
    #endif
  #else
    #define _FVI_EXPORT
  #endif
#endif

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

struct fvi;
typedef struct fvi* fvi_t;

typedef enum fvi_result {
  fvi_ok,
  fvi_invalid_type,
  fvi_invalid_result,
  fvi_ffi_not_found,
  fvi_trans_not_found,
  fvi_system_error,
  fvi_not_supported
} fvi_result;

_FVI_EXPORT const char* fvi_err(fvi_result code);

_FVI_EXPORT fvi_t fvi_init(const uint16_t* file_name);

_FVI_EXPORT void fvi_free(fvi_t info);

_FVI_EXPORT fvi_result
fvi_file_name(fvi_t info, const uint16_t** result);

_FVI_EXPORT fvi_result
fvi_file_major_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_file_minor_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_file_build_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_file_private_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_product_major_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_product_minor_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_product_build_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_product_private_part(fvi_t info, uint16_t* result);

_FVI_EXPORT fvi_result
fvi_is_debug(fvi_t info, bool* result);

_FVI_EXPORT fvi_result
fvi_is_pre_release(fvi_t info, bool* result);

_FVI_EXPORT fvi_result
fvi_is_patched(fvi_t info, bool* result);

_FVI_EXPORT fvi_result
fvi_is_private_build(fvi_t info, bool* result);

_FVI_EXPORT fvi_result
fvi_is_special_build(fvi_t info, bool* result);

#ifdef __cplusplus
}
#endif

#endif  // SRC_FILE_VERSION_INFO_H_