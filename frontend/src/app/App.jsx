import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";;
import { useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const [username, setUsername] = useState( ()=>{
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("username");
  });
  const editorRef = useRef(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);
  
  const handleMount = (editor) => {
    editorRef.current = editor;

    const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
      autoConnect: true
    });

    const monacoBinding = new MonacoBinding(
      yText, 
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
  }

  const handleJoin = (e)=>{
    e.preventDefault();
    setUsername(e.target.username.value);
    history.pushState(null, '', '?username='+e.target.username.value);
  }

  if(!username) {
    return <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
      <form 
        onSubmit={handleJoin}
        className="flex flex-col gap-4">
        <input 
          className="p-2 rounded-lg bg-gray-800 text-white" 
          type="text" 
          placeholder="Enter username"
          name="username"/>
        <button 
          className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
            Join
        </button>
      </form>
    </main>
  }
   
  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4"></aside>
      <section className="h-full w-3/4 bg-neutral-800 rounded-lg p-4">
      <Editor
      height="100%"
      theme="vs-dark"
      language="javascript"
      defaultValue="console.log('Hello, World!');"
      onMount={handleMount}
      />
      </section>
    </main>
  )
}

export default App
