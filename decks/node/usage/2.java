public class MainActivity extends AppCompatActivity {

  private NodeJs nodejs;

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
  }
}