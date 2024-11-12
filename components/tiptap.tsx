'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface TiptapProps {
    value: string;
    onChange: (value: string) => void;
}

const Tiptap: React.FC<TiptapProps> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Scrie o descriere detaliata despre masina ta...',
                // Add these specific CSS properties for the placeholder
                emptyEditorClass: 'is-editor-empty',
            })
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[200px] prose max-w-none',
            },
        },
    })

    return (
        <EditorContent
            editor={editor}
            className="border rounded-md p-4 min-h-[200px] relative [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:absolute [&_.is-editor-empty]:before:text-gray-400 [&_.is-editor-empty]:before:pointer-events-none"
        />
    )
}

export default Tiptap
