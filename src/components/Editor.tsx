import React, {FC} from 'react'
import {
  flowMax,
  addDisplayName,
  addRef,
  addState,
  addHandlers,
  addStateHandlers,
} from 'ad-hok'
import {addEffectOnMount} from 'ad-hok-utils'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

import typedAs from 'utils/typedAs'
import {makeStyles} from 'utils/style'

interface CodeMirrorHandler {
  event: string
  handler: () => void
}

type CodeMirrorInstance = ReturnType<typeof CodeMirror>

type Timer = ReturnType<typeof setTimeout>

interface Props {
  initialValue: string
  onContentChange?: (opts: {value: string; cursorPosition: number}) => void
  onCursorPositionChange?: (cursorPosition: number) => void
}

const Editor: FC<Props> = flowMax(
  addDisplayName('Editor'),
  addRef('container', typedAs<HTMLDivElement | null>(null)),
  addRef('codeMirrorRef', typedAs<CodeMirrorInstance | null>(null)),
  addState('value', 'setValue', ({initialValue}) => initialValue),
  addRef('updateTimerRef', typedAs<Timer | null>(null)),
  addHandlers(
    {
      clearUpdateTimer: ({updateTimerRef}) => () => {
        clearTimeout(updateTimerRef.current!)
      },
    },
    ['updateTimerRef'],
  ),
  addHandlers(
    {
      resetUpdateTimer: ({updateTimerRef, clearUpdateTimer}) => (
        timer: Timer,
      ) => {
        clearUpdateTimer()
        updateTimerRef.current = timer
      },
    },
    ['updateTimerRef', 'clearUpdateTimer'],
  ),
  addStateHandlers(
    {
      codeMirrorHandlers: typedAs<CodeMirrorHandler[]>([]),
    },
    {
      addCodeMirrorHandler: ({codeMirrorHandlers}) => (
        handler: CodeMirrorHandler,
      ) => ({
        codeMirrorHandlers: [...codeMirrorHandlers, handler],
      }),
    },
  ),
  addHandlers({
    addCodeMirrorHandler: ({codeMirrorRef, addCodeMirrorHandler}) => (
      codeMirrorHandler: CodeMirrorHandler,
    ) => {
      addCodeMirrorHandler(codeMirrorHandler)
      codeMirrorRef.current!.on(
        codeMirrorHandler.event,
        codeMirrorHandler.handler,
      )
    },
    unbindCodeMirrorHandlers: ({codeMirrorHandlers, codeMirrorRef}) => () => {
      codeMirrorHandlers.forEach(({event, handler}) => {
        codeMirrorRef.current!.off(event, handler)
      })
    },
  }),
  addHandlers({
    onContentChangeHandler: ({
      onContentChange,
      setValue,
      codeMirrorRef,
    }) => () => {
      const doc = codeMirrorRef.current!.getDoc()
      const value = doc.getValue()
      setValue(value)
      onContentChange?.({
        value,
        cursorPosition: doc.indexFromPos(doc.getCursor()),
      })
    },
    onCursorPositionChangeHandler: ({
      onCursorPositionChange,
      codeMirrorRef,
    }) => () => {
      const doc = codeMirrorRef.current!.getDoc()
      onCursorPositionChange?.(
        doc.indexFromPos(codeMirrorRef.current!.getCursor()),
      )
    },
  }),
  addEffectOnMount(
    ({
      container,
      codeMirrorRef,
      value,
      clearUpdateTimer,
      addCodeMirrorHandler,
      resetUpdateTimer,
      onContentChangeHandler,
      onCursorPositionChangeHandler,
      unbindCodeMirrorHandlers,
    }) => () => {
      const codeMirror = CodeMirror(container.current!, {
        value,
        lineNumbers: true,
      })
      codeMirrorRef.current = codeMirror

      addCodeMirrorHandler({
        event: 'changes',
        handler: () => {
          resetUpdateTimer(setTimeout(onContentChangeHandler, 200))
        },
      })

      addCodeMirrorHandler({
        event: 'cursorActivity',
        handler: () => {
          resetUpdateTimer(setTimeout(onCursorPositionChangeHandler, 100))
        },
      })

      return () => {
        clearUpdateTimer()
        unbindCodeMirrorHandlers()
      }
    },
  ),
  ({container}) => <div css={styles.container} ref={container} />,
)

export default Editor

const styles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
})
