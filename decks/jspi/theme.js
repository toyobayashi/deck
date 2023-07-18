import { vsDark as theme } from '@code-surfer/themes'

theme.styles.CodeSurfer.code.fontFamily = '"Cascadia Code", Consolas, monaco, "黑体", "Courier New", monospace'
// theme.styles.CodeSurfer.subtitle.width = '25%'
// theme.styles.CodeSurfer.subtitle.left = '-0.8em'
// theme.styles.CodeSurfer.subtitle.background = 'rgba(2.2.2,0.4)'
theme.styles.CodeSurfer.subtitle.backgroundColor = 'rgba(2,2,2,0.7)'
theme.styles.CodeSurfer.subtitle.fontSize = '0.9em'
theme.styles.CodeSurfer.subtitle.bottom = '-0.2em'
theme.styles.CodeSurfer.tokens.boolean = { color: 'rgb(100, 102, 149)' }
theme.styles.CodeSurfer.tokens.method = { color: '#DCDCAA' }
theme.styles.CodeSurfer.tokens['maybe-class-name'] = { color: 'rgb(78, 201, 176)' }
theme.styles.CodeSurfer.tokens['macro-name'] = { color: '#BEB7FF' }

export default theme
