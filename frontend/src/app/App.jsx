import "./App.css";

import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

import { useRef, useMemo, useState, useEffect } from "react";

import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const [username, setUsername] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("username");
  });

  const [users, setUsers] = useState([]);
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const monacoBindingRef = useRef(null);

  
  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => {
    return ydoc.getText("monaco");
  }, [ydoc]);


  useEffect(() => {
    if (!username || !editorReady || !editorRef.current) {
      return;
    }

    const provider = new SocketIOProvider(
      "/",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      }
    );

    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      username: username,
    });

    const updateUsers = () => {
      const states = Array.from(
        provider.awareness.getStates().values()
      );

      const collaborators = states
        .map((state) => state?.user)
        .filter((user) => user?.username);

      setUsers(collaborators);
    };

    provider.awareness.on("change", updateUsers);

    updateUsers();

    const model = editorRef.current.getModel();

    if (model) {
      const monacoBinding = new MonacoBinding(
        yText,
        model,
        new Set([editorRef.current]),
        provider.awareness
      );

      monacoBindingRef.current = monacoBinding;
    }

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      provider.awareness.off("change", updateUsers);

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      monacoBindingRef.current?.destroy();
      monacoBindingRef.current = null;

      provider.disconnect();
      providerRef.current = null;

      setUsers([]);
    };
  }, [username, editorReady, ydoc, yText]);


  const handleMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };


  const handleJoin = (e) => {
    e.preventDefault();

    const name = e.target.username.value.trim();

    if (!name) return;

    setUsername(name);

    window.history.pushState(
      null,
      "",
      `?username=${encodeURIComponent(name)}`
    );
  };

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex items-center justify-center">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4"
        >
          <input
            className="p-2 rounded-lg bg-gray-800 text-white"
            type="text"
            placeholder="Enter username"
            name="username"
          />

          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
            type="submit"
          >
            Join
          </button>
        </form>
      </main>
    );
  }


  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4">

        <h2 className="text-2xl font-bold text-neutral-950">
          Collaborators
        </h2>

        <ul className="p-4 space-y-2">
          {users.map((user, index) => (
            <li
              key={`${user.username}-${index}`}
              className="text-neutral-950 font-medium"
            >
              {user.username}
            </li>
          ))}
        </ul>

      </aside>

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
  );
}

export default App;