import React, {FC} from 'react'
import {flowMax, addDisplayName} from 'ad-hok'

import {makeStyles} from 'utils/style'
import colors from 'utils/colors'

const App: FC = flowMax(addDisplayName('App'), () => (
  <div css={styles.container}>Hello world!</div>
))

export default App

const styles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    color: colors.white,
    minHeight: '100vh',
  },
})
