'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Escribir aquí...', 
  className,
  editable = true 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4 space-y-1',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4 space-y-1',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'ml-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none text-sm [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_ul]:pl-4 [&_ol]:pl-4',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const MenuBar = () => (
    <div className="border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className="h-8 w-8 p-0"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className="h-8 w-8 p-0"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className="h-8 w-8 p-0"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );

  // If not editable and no content, return simple display
  if (!editable && !content) {
    return (
      <div className={cn('text-sm text-muted-foreground italic', className)}>
        Sin información
      </div>
    );
  }

  // If not editable, render content as HTML
  if (!editable) {
    return (
      <div 
        className={cn('text-sm prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_ul]:pl-4 [&_ol]:pl-4 [&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_[style*="text-align:_center"]]:text-center [&_[style*="text-align:_right"]]:text-right [&_[style*="text-align:_left"]]:text-left', className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={cn('border border-gray-200 rounded-md bg-white', className)}>
      {editable && <MenuBar />}
      <div 
        onClick={() => editable && editor.commands.focus()}
        className={cn(
          'p-3 min-h-[120px] focus-within:outline-none',
          editable ? 'cursor-text' : 'bg-gray-50 cursor-default'
        )}
      >
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror_p]:my-1 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h2]:my-2 [&_.ProseMirror_h3]:my-1 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_li]:ml-4"
        />
      </div>
    </div>
  );
}
