"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Redo,
  Undo,
} from "lucide-react";

const lowlight = createLowlight(all);

type Props = {
  content: string;
  onChange: (html: string) => void;
  className?: string;
};

const TiptapEditor = ({ content, onChange, className }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // disable default codeBlock since we use lowlight
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 transition-colors",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto my-4 rounded-sm border border-border",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted p-4 rounded-sm font-mono text-sm my-4 overflow-x-auto",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "editorial-content focus:outline-none min-h-[300px] border border-border p-4 rounded-sm bg-background text-foreground",
          className
        ),
      },
    },
  });

  // Sync initial content or database loaded content
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 border border-border bg-muted/30 rounded-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("bold"),
          })}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("italic"),
          })}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("heading", { level: 1 }),
          })}
          title="H1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("heading", { level: 2 }),
          })}
          title="H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("bulletList"),
          })}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("orderedList"),
          })}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("blockquote"),
          })}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("code"),
          })}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("codeBlock"),
          })}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", {
            "bg-foreground text-background hover:bg-foreground/90": editor.isActive("link"),
          })}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-sm hover:bg-muted transition-colors"
          title="Add Image URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-sm hover:bg-muted transition-colors disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-sm hover:bg-muted transition-colors disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
