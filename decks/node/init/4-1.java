public class NodeJs {
  static {
    System.loadLibrary("native-lib");
  }

  public native static int initialize();
  public native static void shutdown();
}

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    NodeJs.initialize();
  }
}