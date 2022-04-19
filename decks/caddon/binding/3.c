#include <stdlib.h>
#include <node_api.h>
#include "file_version_info.h"

#define NAPI_CALL(env, call)                                      \
  do {                                                            \
    napi_status status = (call);                                  \
    if (status != napi_ok) {                                      \
      const napi_extended_error_info* error_info = NULL;          \
      napi_get_last_error_info((env), &error_info);               \
      const char* err_message = error_info->error_message;        \
      bool is_pending;                                            \
      napi_is_exception_pending((env), &is_pending);              \
      if (!is_pending) {                                          \
        const char* message = (err_message == NULL)               \
            ? "empty error message"                               \
            : err_message;                                        \
        napi_throw_error((env), NULL, message);                   \
        return NULL;                                              \
      }                                                           \
    }                                                             \
  } while (0)

static void finalize_instance(napi_env env,
                              void* finalize_data,
                              void* finalize_hint) {
  napi_delete_reference(env, (napi_ref) finalize_data);
}

static napi_value
js_fvi_constructor(napi_env env, napi_callback_info info) {

}

NAPI_MODULE_INIT() {
  DEFINE_PROPERTIES(prototype);
  size_t property_count = sizeof(prototype) / sizeof(napi_property_descriptor);
  napi_value constructor;
  // class FileVersionInfo { constructor = js_fvi_constructor }
  NAPI_CALL(env, napi_define_class(
    env, "FileVersionInfo", NAPI_AUTO_LENGTH, js_fvi_constructor, NULL,
    property_count, prototype, &constructor));

  napi_ref cons_ref;
  NAPI_CALL(env, napi_create_reference(env, constructor, 1, &cons_ref));
  NAPI_CALL(env, napi_set_instance_data(env,
    cons_ref, finalize_instance, NULL));
  // exports.FileVersionInfo = FileVersionInfo
  NAPI_CALL(env, napi_set_named_property(env,
                                         exports,
                                         "FileVersionInfo",
                                         constructor));
  return exports;
}