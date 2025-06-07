import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import './RichTextEditor.css'; // Custom styles for the editor container

const RichTextEditor = ({ value, onChange, placeholder, readOnly = false }) => {
  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        {'list': 'ordered'},
        {'list': 'bullet'},
        {'indent': '-1'},
        {'indent': '+1'}
      ],
      ['link', 'image', 'video'], // 'image' and 'video' might require server-side handling for uploads
      ['clean'], // remove formatting button
      [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
      [{ 'align': [] }],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  return (
    <div className={`rich-text-editor-container ${readOnly ? 'read-only' : ''}`}>
      <ReactQuill 
        theme="snow" 
        value={value || ''} 
        onChange={onChange} 
        modules={modules} 
        formats={formats} 
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};

export default RichTextEditor;
