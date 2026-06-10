'use client';

import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { format } from 'sql-formatter';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  schema?: Record<string, { columns: { name: string; type: string }[] }>;
  height?: string;
}

export function MonacoEditor({ value, onChange, onRun, schema, height = '220px' }: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monaco = useMonaco();
  const completionProviderRef = useRef<any>(null);

  useEffect(() => {
    if (!monaco || !schema) return;

    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
      completionProviderRef.current = null;
    }

    const disposable = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: import('monaco-editor').editor.ITextModel, position: import('monaco-editor').Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const tables = Object.keys(schema);
        const suggestions = [
          ...tables.map((t) => ({ label: t, kind: monaco.languages.CompletionItemKind.Class, insertText: t, range })),
          ...tables.flatMap((t) =>
            schema[t].columns.map((c) => ({
              label: `${t}.${c.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: c.name,
              range,
            }))
          ),
        ];
        return { suggestions };
      },
    });

    completionProviderRef.current = disposable;

    return () => {
      disposable.dispose();
      completionProviderRef.current = null;
    };
  }, [monaco, schema]);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    editor.addAction({
      id: 'run-query',
      label: 'Run Query',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter],
      run: () => onRun?.(),
    });
    editor.addAction({
      id: 'format-sql',
      label: 'Format SQL',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyF],
      run: () => {
        try {
          onChange(format(editor.getValue(), { language: 'sqlite' }));
        } catch { /* ignore */ }
      },
    });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Editor
        height={height}
        language="sql"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'IBM Plex Mono, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
