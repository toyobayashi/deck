// import { vsDark as theme } from '@code-surfer/themes'

// theme.styles.CodeSurfer.code.fontFamily = 'Consolas'

// export default theme

// https://github.com/FormidableLabs/prism-react-renderer/tree/master/tools/themeFromVsCode

function makeTheme(
  prismTheme,
  override = {}
) {
  const tokens = {}
  prismTheme.styles.forEach(s => {
    tokens[s.types.join(' ')] = s.style;
  });

  const theme = {
    colors: {
      text: prismTheme.plain.color,
      background: prismTheme.plain.backgroundColor
    },
    styles: {
      CodeSurfer: {
        tokens,
        title: {
          backgroundColor: prismTheme.plain.backgroundColor,
          color: prismTheme.plain.color
        },
        subtitle: {
          color: '#d6deeb',
          backgroundColor: 'rgba(10,10,10,0.9)'
        },
        pre: {
          color: prismTheme.plain.color,
          backgroundColor: prismTheme.plain.backgroundColor
        },
        code: {
          color: prismTheme.plain.color,
          backgroundColor: prismTheme.plain.backgroundColor
        },
        ...override
      }
    }
  };

  const stringStyle = prismTheme.styles.find(s => s.types.includes('string'))
  const primary = stringStyle && (stringStyle.style.color)
  if (theme.colors && primary) {
    theme.colors.primary = primary
  }

  return theme
}


export default makeTheme({
  plain: {
    color: '#f8f8f2',
    backgroundColor: '#272822'
  },
  styles: [
    {
      types: ['keyword', 'operator', 'interpolation-punctuation'],
      style: {
        color: 'rgb(249, 38, 114)'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: 'rgb(248, 248, 242)'
      }
    },
    {
      types: ['arrow'],
      style: {
        color: '#66d9ef',
        fontStyle: 'italic'
      }
    },
    {
      types: ['class-name', 'maybe-class-name'],
      style: {
        color: 'rgb(166, 226, 46)',
        textDecoration: 'underline'
      }
    },
    {
      types: ['parameter'],
      style: {
        color: '#FD971F',
        fontStyle: 'italic'
      }
    },
    {
      types: ['comment'],
      style: {
        color: 'rgb(136, 132, 111)'
      }
    },
    {
      types: [
        'string',
        'changed',
        'attr-value',
        'template-punctuation'
      ],
      style: {
        color: 'rgb(230, 219, 116)'
      }
    },
    {
      types: ['tag', 'deleted'],
      style: {
        color: 'rgb(249, 38, 114)'
      }
    },
    {
      types: ['builtin'],
      style: {
        color: '#66d9ef'
      }
    },
    {
      types: [
        'number',
        'constant',
        'boolean'
      ],
      style: {
        color: 'rgb(174, 129, 255)'
      }
    },
    {
      types: ['variable'],
      style: {
        color: 'rgb(248, 248, 242)'
      }
    },
    {
      types: [
        'function',
        'function-variable',
        'method',
        'attr-name',
        'inserted',
        'selector'
      ],
      style: {
        color: 'rgb(166, 226, 46)'
      }
    },
    {
      types: ['namespace'],
      style: {
        color: 'rgb(252, 137, 185)',
        'fontStyle': 'italic'
      }
    }
  ]
}, {
  code: {
    fontFamily: 'Consolas'
  }
})
