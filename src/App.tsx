import React, {FC} from 'react'
import {flowMax, addDisplayName, addStateHandlers} from 'ad-hok'

import {makeStyles} from 'utils/style'
import colors from 'utils/colors'
import Editor from 'components/Editor'
import {addCodeMirrorGlobalStyles} from 'utils/codeMirror'

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
        cursor,
      }: {
        value: string
        cursor: number
      }) => ({
        code: value,
        codeCursorPosition: cursor,
      }),
    },
  ),
  ({onCodeContentChange}) => (
    <div css={styles.container}>
      <Editor initialValue="" onContentChange={onCodeContentChange} />
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
