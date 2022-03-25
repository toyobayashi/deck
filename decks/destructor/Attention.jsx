import * as React from 'react'

export default function (props) {
  const to = props.to || 'JavaScript 学习者观众'
  return <>
    <p>视频内容 <strong>不保证</strong> 对所有人都有意义</p>
    <p>但可以尽量保证对 <strong>大多数</strong> {to}有意义</p>
    <p>认为用处不大或没有意义，也请尊重劳动成果</p>
    <p>有错误之处欢迎评论区留言指正，认为有帮助可以一键三连</p>
  </>
}
