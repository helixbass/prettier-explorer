import React from 'react'
import {SimpleUnchangedProps, flowMax, addWrapper} from 'ad-hok'
import {Global as GlobalStyles} from '@emotion/core'

export const addCodeMirrorGlobalStyles: SimpleUnchangedProps = flowMax(
  addWrapper((render) => (
    <>
      <GlobalStyles
        styles={{
          '.CodeMirror': {
            height: 'auto',
            flex: 1,
          },
        }}
      />
      {render()}
    </>
  )),
)
