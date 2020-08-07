import React, {FC} from 'react'
import {flowMax, addDisplayName, addStateHandlers} from 'ad-hok'

import {makeStyles} from 'utils/style'
import colors from 'utils/colors'
import Editor from 'components/Editor'
import {addCodeMirrorGlobalStyles} from 'utils/codeMirror'
import {log} from 'utils/fp'

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
  log('pr'),
  ({onCodeContentChange, onCodeCursorPositionChange}) => (
    <div css={styles.container}>
      <Editor
        initialValue=""
        onContentChange={onCodeContentChange}
        onCursorPositionChange={onCodeCursorPositionChange}
      />
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
