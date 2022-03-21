class Component { /* ... */ }

class App extends Component {
  get count () {
    return this.state.count
  }

  constructor (props) {
    super(props)
    // 这里开始 this 可用
    console.log(new.target)
    this.state = { count: 0 }
  }

  render () {
    return App.createElement(
      'div', {},
      App.createElement(
        'p',
        {
          onClick: () => {
            this.setState({
              count: this.count + 1
            })
          }
        },
        `count: ${this.count}`
      )
    )
  }

  static defaultProps = {}

  static get displayName () {
    return 'App'
  }
}