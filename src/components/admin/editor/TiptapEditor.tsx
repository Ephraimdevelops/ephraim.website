"use client";

import { useEditor, EditorContent } from "@tiptap/react";
// import { BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';

const lowlight = createLowlight(all);
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Link as LinkIcon,
    Quote,
    Image as ImageIcon
} from "lucide-react";

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
}

export function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-400 underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg border border-white/10 my-4 max-w-full",
                },
            }),
            Placeholder.configure({
                placeholder: "Write something amazing...",
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[300px]",
            },
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="relative">
            {/* {editable && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="flex items-center gap-1 p-1 bg-[#1A1D24] border border-white/10 rounded-lg shadow-xl"
                >
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("bold") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("italic") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("heading", { level: 2 }) ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={setLink}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("link") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                </BubbleMenu>
            )} */}

            {/* Floating Toolbar (Optional - placed above editor) */}
            {editable && (
                <div className="sticky top-0 z-10 flex items-center gap-2 p-2 mb-4 bg-[#0A0C14]/80 backdrop-blur border-b border-white/10">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive("heading", { level: 1 }) ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Heading1 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive("heading", { level: 2 }) ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Heading2 className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive("bulletList") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive("orderedList") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <ListOrdered className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive("blockquote") ? "text-white bg-white/10" : "text-white/60"
                            }`}
                    >
                        <Quote className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={addImage}
                        className="p-2 rounded hover:bg-white/10 transition-colors text-white/60"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
