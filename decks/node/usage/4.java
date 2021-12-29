public class MainActivity extends AppCompatActivity {

  private NodeJs nodejs;

  private Button btn;
  private Button btn2;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    try {
      nodejs = NodeJs.create();
    } catch (Exception e) {
      Toast.makeText(MainActivity.this, e.toString(), Toast.LENGTH_SHORT).show();
      finish();
      return;
    }

    btn = findViewById(R.id.btn);
    btn2 = findViewById(R.id.btn2);

    btn.setOnClickListener((View v) -> {
      new Thread(() -> {
        try {
          nodejs.evalVoid("console.log(process.version, process.platform)");
          int r = nodejs.evalInt("2 + 3");
          Log.d("NODE_EXAMPLE", String.valueOf(r));
          r = nodejs.evalInt("2.5 + 0.1");
          Log.d("NODE_EXAMPLE", String.valueOf(r));
          double dv = nodejs.evalDouble("2.5 + 0.1");
          Log.d("NODE_EXAMPLE", String.valueOf(dv));
          boolean b = nodejs.evalBool("process.platform === 'android'");
          Log.d("NODE_EXAMPLE", String.valueOf(b));
          String str = nodejs.evalString("process.version");
          Log.d("NODE_EXAMPLE", str);
          nodejs.evalVoid("process._linkedBinding('android').toast('123')");
        } catch (Exception e) {
          runOnUiThread(() -> {
            Toast.makeText(MainActivity.this, e.toString(), Toast.LENGTH_SHORT).show();
          });
          e.printStackTrace();
        }
      }).start();
    });
  }
}