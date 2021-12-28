public class NodeJs {
  static {
    System.loadLibrary("native-lib");
  }

  public native static int initialize();
  public native static void shutdown();
}