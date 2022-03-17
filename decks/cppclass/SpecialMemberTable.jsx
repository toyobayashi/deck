import * as React from 'react'

const tableStyle = {
  fontSize: '0.8em'
}

export default function ({ step }) {
  return (
    <div>
      <p>横向：编译器隐式声明 / 纵向：用户显式声明</p>
      <table style={tableStyle} border={1} cellpadding={10}>
        <thead>
          <tr><th>用户声明</th><th>默认构造</th><th>析构</th><th>拷贝构造</th><th>拷贝赋值</th><th>移动构造</th><th>移动赋值</th></tr>
        </thead>
        <tbody>
          {step > 0 ? (<tr><td>不声明</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td></tr>) : null}
          {step > 1 ? (<tr><td>任意构造函数</td><td>未声明</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td></tr>) : null}
          {step > 2 ? (<tr><td>默认构造</td><td></td><td>默认</td><td>默认</td><td>默认</td><td>默认</td><td>默认</td></tr>) : null}
          {step > 3 ? (<tr><td>析构</td><td>默认</td><td></td><td>默认（危）</td><td>默认（危）</td><td>未声明</td><td>未声明</td></tr>) : null}
          {step > 4 ? (<tr><td>拷贝构造</td><td>未声明</td><td>默认</td><td></td><td>默认（危）</td><td>未声明</td><td>未声明</td></tr>) : null}
          {step > 5 ? (<tr><td>拷贝赋值</td><td>默认</td><td>默认</td><td>默认（危）</td><td></td><td>未声明</td><td>未声明</td></tr>) : null}
          {step > 6 ? (<tr><td>移动构造</td><td>未声明</td><td>默认</td><td>删除</td><td>删除</td><td></td><td>未声明</td></tr>) : null}
          {step > 7 ? (<tr><td>移动赋值</td><td>默认</td><td>默认</td><td>删除</td><td>删除</td><td>未声明</td><td></td></tr>) : null}
        </tbody>
      </table>
    </div>
  )
}
