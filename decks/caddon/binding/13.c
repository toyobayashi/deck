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

#define STRING_TABLE_GETTER(fname, id)                                        \
  static napi_value getter_##fname(napi_env env, napi_callback_info info) {   \
    fvi_t data;                                                               \
    napi_value this_arg;                                                      \
    NAPI_CALL(env, napi_get_cb_info(env, info, NULL, NULL, &this_arg, NULL)); \
    NAPI_CALL(env, napi_unwrap(env, this_arg, &data));                        \
    char16_t* res = NULL;                                                     \
    uint32_t res_size = 0;                                                    \
    fvi_result r = fvi_string_file_info(data, (id), &res, &res_size);         \
    if (r != fvi_ok) {                                                        \
      napi_throw_error(env, NULL, fvi_err(r));                                \
      return NULL;                                                            \
    }                                                                         \
    napi_value ret;                                                           \
    NAPI_CALL(env, napi_create_string_utf16(env, res, res_size, &ret));       \
    return ret;                                                               \
  }

STRING_TABLE_GETTER(comments, FVI_SFI_COMMENTS)
STRING_TABLE_GETTER(company_name, FVI_SFI_COMPANYNAME)
STRING_TABLE_GETTER(file_description, FVI_SFI_FILEDESCRIPTION)
STRING_TABLE_GETTER(file_version, FVI_SFI_FILEVERSION)
STRING_TABLE_GETTER(internal_name, FVI_SFI_INTERNALNAME)
STRING_TABLE_GETTER(legal_copyright, FVI_SFI_LEGALCOPYRIGHT)
STRING_TABLE_GETTER(legal_trademarks, FVI_SFI_LEGALTRADEMARKS)
STRING_TABLE_GETTER(original_filename, FVI_SFI_ORIGINALFILENAME)
STRING_TABLE_GETTER(private_build, FVI_SFI_PRIVATEBUILD)
STRING_TABLE_GETTER(product_name, FVI_SFI_PRODUCTNAME)
STRING_TABLE_GETTER(product_version, FVI_SFI_PRODUCTVERSION)
STRING_TABLE_GETTER(special_build, FVI_SFI_SPECIALBUILD)

#define UINT_GETTER(fname)                                                    \
  static napi_value getter_##fname(napi_env env, napi_callback_info info) {   \
    fvi_t data;                                                               \
    napi_value this_arg;                                                      \
    NAPI_CALL(env, napi_get_cb_info(env, info, NULL, NULL, &this_arg, NULL)); \
    NAPI_CALL(env, napi_unwrap(env, this_arg, &data));                        \
    uint16_t res = 0;                                                         \
    fvi_result r = fvi_##fname(data, &res);                                   \
    if (r != fvi_ok) {                                                        \
      napi_throw_error(env, NULL, fvi_err(r));                                \
      return NULL;                                                            \
    }                                                                         \
    napi_value ret;                                                           \
    NAPI_CALL(env, napi_create_uint32(env, res, &ret));                       \
    return ret;                                                               \
  }

UINT_GETTER(file_major_part)
UINT_GETTER(file_minor_part)
UINT_GETTER(file_build_part)
UINT_GETTER(file_private_part)
UINT_GETTER(product_major_part)
UINT_GETTER(product_minor_part)
UINT_GETTER(product_build_part)
UINT_GETTER(product_private_part)

#define BOOL_GETTER(fname)                                                    \
  static napi_value getter_##fname(napi_env env, napi_callback_info info) {   \
    fvi_t data;                                                               \
    napi_value this_arg;                                                      \
    NAPI_CALL(env, napi_get_cb_info(env, info, NULL, NULL, &this_arg, NULL)); \
    NAPI_CALL(env, napi_unwrap(env, this_arg, &data));                        \
    bool res = false;                                                         \
    fvi_result r = fvi_##fname(data, &res);                                   \
    if (r != fvi_ok) {                                                        \
      napi_throw_error(env, NULL, fvi_err(r));                                \
      return NULL;                                                            \
    }                                                                         \
    napi_value ret;                                                           \
    NAPI_CALL(env, napi_get_boolean(env, res, &ret));                         \
    return ret;                                                               \
  }

BOOL_GETTER(is_debug)
BOOL_GETTER(is_pre_release)
BOOL_GETTER(is_patched)
BOOL_GETTER(is_private_build)
BOOL_GETTER(is_special_build)

#define UTF16_GETTER(fname)                                                   \
  static napi_value getter_##fname(napi_env env, napi_callback_info info) {   \
    fvi_t data;                                                               \
    napi_value this_arg;                                                      \
    NAPI_CALL(env, napi_get_cb_info(env, info, NULL, NULL, &this_arg, NULL)); \
    NAPI_CALL(env, napi_unwrap(env, this_arg, &data));                        \
    const uint16_t* res = NULL;                                               \
    fvi_result r = fvi_##fname(data, &res);                                   \
    if (r != fvi_ok) {                                                        \
      napi_throw_error(env, NULL, fvi_err(r));                                \
      return NULL;                                                            \
    }                                                                         \
    napi_value ret;                                                           \
    NAPI_CALL(env, napi_create_string_utf16(                                  \
      env, res, NAPI_AUTO_LENGTH, &ret));                                     \
    return ret;                                                               \
  }

UTF16_GETTER(file_name)
UTF16_GETTER(language)

#define DECLARE_NAPI_GETTER(name, fname) \
  { (name), NULL, NULL, (getter_##fname), NULL, NULL, napi_configurable, NULL }

#define DEFINE_PROPERTIES(var)                                       \
  napi_property_descriptor var[] = {                                 \
    DECLARE_NAPI_GETTER("comments", comments),                       \
    DECLARE_NAPI_GETTER("companyName", company_name),                \
    DECLARE_NAPI_GETTER("fileDescription", file_description),        \
    DECLARE_NAPI_GETTER("fileVersion", file_version),                \
    DECLARE_NAPI_GETTER("internalName", internal_name),              \
    DECLARE_NAPI_GETTER("legalCopyright", legal_copyright),          \
    DECLARE_NAPI_GETTER("legalTrademarks", legal_trademarks),        \
    DECLARE_NAPI_GETTER("originalFilename", original_filename),      \
    DECLARE_NAPI_GETTER("privateBuild", private_build),              \
    DECLARE_NAPI_GETTER("productName", product_name),                \
    DECLARE_NAPI_GETTER("productVersion", product_version),          \
    DECLARE_NAPI_GETTER("specialBuild", special_build),              \
    DECLARE_NAPI_GETTER("fileMajorPart", file_major_part),           \
    DECLARE_NAPI_GETTER("fileMinorPart", file_minor_part),           \
    DECLARE_NAPI_GETTER("fileBuildPart", file_build_part),           \
    DECLARE_NAPI_GETTER("filePrivatePart", file_private_part),       \
    DECLARE_NAPI_GETTER("productMajorPart", product_major_part),     \
    DECLARE_NAPI_GETTER("productMinorPart", product_minor_part),     \
    DECLARE_NAPI_GETTER("productBuildPart", product_build_part),     \
    DECLARE_NAPI_GETTER("productPrivatePart", product_private_part), \
    DECLARE_NAPI_GETTER("isDebug", is_debug),                        \
    DECLARE_NAPI_GETTER("isPreRelease", is_pre_release),             \
    DECLARE_NAPI_GETTER("isPatched", is_patched),                    \
    DECLARE_NAPI_GETTER("isPrivateBuild", is_private_build),         \
    DECLARE_NAPI_GETTER("isSpecialBuild", is_special_build),         \
    DECLARE_NAPI_GETTER("fileName", file_name),                      \
    DECLARE_NAPI_GETTER("language", language)                        \
  }

static void finalize_instance(napi_env env,
                              void* finalize_data,
                              void* finalize_hint) {
  napi_delete_reference(env, (napi_ref) finalize_data);
}

static void finalize_obj(napi_env env,
                         void* finalize_data,
                         void* finalize_hint) {
  fvi_free((fvi_t) finalize_data);
}

static napi_value
js_fvi_constructor(napi_env env, napi_callback_info info) {
  napi_value new_target = NULL;
  NAPI_CALL(env, napi_get_new_target(env, info, &new_target));
  if (new_target == NULL) {
    NAPI_CALL(env, napi_throw_type_error(
      env, NULL, "Constructor FileVersionInfo requires 'new'"));
    return NULL;
  }

  napi_value external;
  napi_value this_arg;
  size_t argc = 1;
  NAPI_CALL(env, napi_get_cb_info(
    env, info, &argc, &external, &this_arg, NULL));

  void* data = NULL;
  NAPI_CALL(env, napi_get_value_external(env, external, &data));
  NAPI_CALL(env, napi_wrap(env, this_arg, data, finalize_obj, NULL, NULL));
  return this_arg;
}

static napi_value
get_version_info_internal(napi_env env, napi_callback_info info) {
  napi_value file_name;
  size_t argc = 1;
  NAPI_CALL(env, napi_get_cb_info(env, info, &argc, &file_name, NULL, NULL));

  size_t len_exclude_null = 0;
  NAPI_CALL(env, napi_get_value_string_utf16(env, file_name,
    NULL, 0, &len_exclude_null));

  size_t len = (len_exclude_null + 1) * sizeof(char16_t);
  char16_t* filename = (char16_t*) malloc(len);
  if (!filename) return NULL;
  napi_status s = napi_get_value_string_utf16(env, file_name,
    filename, len, &len_exclude_null);

  if (s != napi_ok) {
    const napi_extended_error_info* error_info = NULL;
    napi_get_last_error_info((env), &error_info);
    const char* err_message = error_info->error_message;
    bool is_pending;
    napi_is_exception_pending(env, &is_pending);
    if (!is_pending) {
      const char* message = (err_message == NULL)
          ? "empty error message"
          : err_message;
      free(filename);
      napi_throw_error(env, NULL, message);
      return NULL;
    }
  }

  fvi_t file_version_info = fvi_init(filename);
  free(filename);

  napi_ref cons_ref;
  napi_value constructor;
  NAPI_CALL(env, napi_get_instance_data(env, (void**) &cons_ref));
  NAPI_CALL(env, napi_get_reference_value(env, cons_ref, &constructor));
  napi_value external;
  // const external = new External(file_version_info)
  NAPI_CALL(env, napi_create_external(env,
    file_version_info, NULL, NULL, &external));
  napi_value ret;
  // return new FileVersionInfo(external)
  NAPI_CALL(env, napi_new_instance(env, constructor, 1, &external, &ret));
  return ret;
}

#define NAPI_EXPORT_FUNCTION(env, exports, name, fn)        \
  do {                                                      \
    napi_value js_##fn;                                     \
    NAPI_CALL((env), napi_create_function((env),            \
                                          (name),           \
                                          NAPI_AUTO_LENGTH, \
                                          (fn),             \
                                          NULL,             \
                                          &js_##fn));       \
    NAPI_CALL((env), napi_set_named_property((env),         \
                                             (exports),     \
                                             (name),        \
                                             js_##fn));     \
  } while (0)

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
  // exports.getVersionInfoInternal = get_version_info_internal
  NAPI_EXPORT_FUNCTION(env, exports,
    "getVersionInfoInternal", get_version_info_internal);
  return exports;
}