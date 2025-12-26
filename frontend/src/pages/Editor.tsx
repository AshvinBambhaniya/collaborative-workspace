import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useSocket } from '../context/SocketContext';
import { Play, Terminal as TerminalIcon, FileCode } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-hot-toast';

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { socket } = useSocket();
  const [code, setCode] = useState('// Start coding here\nconsole.log("Hello World");');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (socket && projectId) {
      socket.emit('join_project', projectId);

      socket.on('file_change', (data: any) => {
        // Prevent update loop if we are the sender (though server broadcasts to others usually)
        if (editorRef.current && data.content !== editorRef.current.getValue()) {
            // Save cursor position?
            // Simple update for now
            editorRef.current.setValue(data.content);
        }
      });

      socket.on('user_joined', (data: any) => {
          toast(`${data.userId} joined the session`, { icon: '👋' });
      });

      return () => {
        socket.off('file_change');
        socket.off('user_joined');
        socket.emit('leave_project', projectId);
      };
    }
  }, [socket, projectId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      socket?.emit('file_change', { projectId, content: value, filePath: 'main.js' });
    }
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const res = await api.post('/jobs', {
        code,
        language: 'javascript'
      });
      const jobId = res.data.jobId;

      // Poll for result
      const poll = setInterval(async () => {
        const statusRes = await api.get(`/jobs/${jobId}`);
        const status = statusRes.data.status;
        
        if (status === 'completed') {
          clearInterval(poll);
          setOutput(JSON.stringify(statusRes.data.result, null, 2));
          setIsRunning(false);
        } else if (status === 'failed') {
          clearInterval(poll);
          setOutput(`Error: ${statusRes.data.error}`);
          setIsRunning(false);
        }
      }, 1000);

    } catch (error) {
      setOutput('Failed to start execution');
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar Mock */}
      <div className="w-full lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 font-semibold flex items-center">
            <FileCode className="w-5 h-5 mr-2" />
            Files
        </div>
        <div className="p-2">
            <div className="px-3 py-2 bg-slate-800 rounded text-sm text-white cursor-pointer flex items-center">
                <span className="text-yellow-400 mr-2">JS</span> main.js
            </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4">
            <div className="font-medium text-slate-700">main.js</div>
            <div className="flex space-x-2">
                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className={`flex items-center px-3 py-1.5 rounded text-sm font-medium text-white ${isRunning ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    {isRunning ? 'Running...' : 'Run'}
                </button>
            </div>
        </div>
        <div className="flex-1 relative">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                }}
            />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="w-full lg:w-96 bg-slate-900 text-slate-100 flex-shrink-0 border-l border-slate-800 flex flex-col">
          <div className="h-10 bg-slate-800 flex items-center px-4 font-mono text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <TerminalIcon className="w-4 h-4 mr-2" />
              Console Output
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-green-400">
              {output || <span className="text-slate-600">No output to display. Run code to see results.</span>}
          </div>
      </div>
    </div>
  );
};
