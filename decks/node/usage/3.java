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
  }
}