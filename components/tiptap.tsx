'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface TiptapProps {
    value: string;
    onChange: (value: string) => void;
}

const Tiptap: React.FC<TiptapProps> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[200px]',
            },
        },
    })

    return <EditorContent editor={editor} className="border rounded-md p-4 min-h-[200px]" />
}

export default Tiptap
