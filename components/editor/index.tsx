'use client';

import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { type FC, useEffect, useState } from 'react';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { useDebouncedCallback } from 'use-debounce';

import { EditorBubbleMenu } from './components';
import { TiptapExtensions } from './extensions';
import { TiptapEditorProps } from './props';

const markdownToHtml = unified().use(remarkParse).use(remarkHtml);

const htmlToMarkdown = unified()
  .use(rehypeParse, { fragment: true }) // fragment option allows parsing fragments, not full HTML documents
  .use(rehypeRemark)
  .use(remarkStringify, {
    join: [
      (left, right) => {
        if (left.type === 'listItem' && right.type === 'listItem') {
          return 0;
        }
        return 1;
      },
    ],
  });

type BlockEditorProps = {
  name: string;
  initialContent?: string;
};

const BlockEditor: FC<BlockEditorProps> = ({ name, initialContent }) => {
  const [hydrated, setHydrated] = useState(false);
  const [outputValue, setOutputValue] = useState('');

  const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    const html = editor.getHTML();
    const markdown = await htmlToMarkdown.process(html);
    setOutputValue(markdown.toString());
  }, 250);

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (event) => {
      debouncedUpdates(event.editor);
    },
    autofocus: 'end',
  });

  useEffect(() => {
    if (editor && initialContent && !hydrated) {
      const html = markdownToHtml.processSync(initialContent).toString();

      editor.commands.setContent(html);
      setOutputValue(initialContent);
      setHydrated(true);
    }
  }, [editor, initialContent, hydrated]);

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="relative mb-4 flex min-h-[500px] w-full cursor-text rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    >
      {editor && (
        <>
          <EditorContent editor={editor} />
          <EditorBubbleMenu editor={editor} />
        </>
      )}

      <input name={name} value={outputValue} type="hidden" />
    </div>
  );
};

export default BlockEditor;
