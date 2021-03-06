import React, {FC} from 'react'
import {
  flowMax,
  addDisplayName,
  addStateHandlers,
  addState,
  addEffect,
} from 'ad-hok'
import getPrettierFormatted from 'api/getPrettierFormatted'

import {makeStyles} from 'utils/style'
import colors from 'utils/colors'
import Editor from 'components/Editor'
import {addCodeMirrorGlobalStyles} from 'utils/codeMirror'
import {invoke} from 'utils/fp'

const App: FC = flowMax(
  addDisplayName('App'),
  addCodeMirrorGlobalStyles,
  addStateHandlers(
    {
      code: '',
      codeCursorPosition: 0,
    },
    {
      onCodeContentChange: () => ({
        value,
        cursorPosition,
      }: {
        value: string
        cursorPosition: number
      }) => ({
        code: value,
        codeCursorPosition: cursorPosition,
      }),
      onCodeCursorPositionChange: () => (cursorPosition: number) => ({
        codeCursorPosition: cursorPosition,
      }),
    },
  ),
  addState('formattedCode', 'setFormattedCode', ''),
  // eslint-disable-next-line ad-hok/dependencies
  addEffect(
    ({code, setFormattedCode}) => () => {
      invoke(async () => {
        const response = await getPrettierFormatted(code)
        console.log({response})
        const {formatted} = response.data
        setFormattedCode(formatted)
      })
    },
    ['code'],
  ),
  ({onCodeContentChange, onCodeCursorPositionChange, formattedCode}) => (
    <div css={styles.container}>
      <Editor
        initialValue=""
        onContentChange={onCodeContentChange}
        onCursorPositionChange={onCodeCursorPositionChange}
      />
      <div>
        <pre>{formattedCode}</pre>
      </div>
    </div>
  ),
)

export default App

const styles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.white,
    color: colors.black,
    minHeight: '100vh',
  },
})
