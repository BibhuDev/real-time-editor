import "./App.css";
import { Editor } from "@monaco-editor/react";

function App() {

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4"></aside>
      <section className="h-full w-3/4 bg-neutral-800 rounded-lg p-4">
      <Editor
      height="100%"
      theme="vs-dark"
      language="javascript"
      defaultValue="console.log('Hello, World!');"
      />
      </section>
    </main>
  )
}

export default App
