class Component { /* ... */ }

class App extends Component {
  constructor (props) {
    super(props)
    // 这里开始 this 可用
    console.log(new.target)
    this.state = { count: 0 }
  }
}