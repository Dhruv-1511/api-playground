'use client'

import dynamic from 'next/dynamic'
import type { EditorProps } from '@monaco-editor/react'

const Editor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    )
  }
)

export default function MonacoEditor(props: EditorProps) {
  return <Editor {...props} />
}
