public class NodeJs {
  static {
    System.loadLibrary("native-lib");
  }

  private long nativePointer;

  private NodeJs (long pointer) {
    nativePointer = pointer;
  }

  public long getNativePointer() {
    return nativePointer;
  }

  public static NodeJs create() throws Exception {
    return new NodeJs(createInstance());
  }
  private native static long createInstance() throws Exception;
  public native static int runMain(String path,
                                   String[] args) throws Exception;

  public native static int initialize();
  public native static void shutdown();

  public native void evalVoid(String script) throws Exception;
  public native boolean evalBool(String script) throws Exception;
  public native int evalInt(String script) throws Exception;
  public native double evalDouble(String script) throws Exception;

  protected native int dispose();
  protected void finalize() {
    dispose();
  }
}