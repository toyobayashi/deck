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

#endif  // SRC_FILE_VERSION_INFO_H_