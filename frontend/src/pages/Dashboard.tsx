import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle, Circle, Loader2, Pencil, X, Save } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  userId: number;
  user?: { name: string };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error: any) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);
    try {
      const { data } = await api.post('/tasks', { title, description });
      setTasks([...tasks, data]);
      setTitle('');
      setDescription('');
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { ...task, isCompleted: !task.isCompleted });
      setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (task: Task) => {
    if (!editTitle) return;
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { ...task, title: editTitle, description: editDescription });
      setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
      toast.success('Task updated');
      cancelEdit();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const renderTask = (task: Task) => (
    <div 
      key={task.id} 
      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${task.isCompleted ? 'bg-gray-50/80 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-70' : 'bg-white/90 dark:bg-slate-900/90 border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1'}`}
    >
      {editingId === task.id ? (
        <div className="flex-grow flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={editTitle} 
            onChange={e => setEditTitle(e.target.value)} 
            className="flex-grow px-4 py-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
          />
          <input 
            type="text" 
            value={editDescription} 
            onChange={e => setEditDescription(e.target.value)} 
            placeholder="Description"
            className="flex-grow px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
          />
          <div className="flex items-center gap-2">
            <button onClick={() => saveEdit(task)} className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-sm">
              <Save size={20} />
            </button>
            <button onClick={cancelEdit} className="p-2.5 bg-gray-400 hover:bg-gray-500 text-white rounded-xl transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 flex-grow">
            <button 
              onClick={() => toggleTask(task)}
              className={`mt-1 rounded-full transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-purple-500'}`}
            >
              {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h3 className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                  {task.title}
                </h3>
                {task.user?.name && task.userId !== user?.id && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-sm">
                    {task.user.name}
                  </span>
                )}
              </div>
              {task.description && (
                 <p className={`text-sm mt-1 ${task.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={() => startEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit task"
            >
              <Pencil size={20} />
            </button>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Task</h2>
        <form onSubmit={createTask} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Task Title..." 
            className="flex-grow px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Description (optional)" 
            className="flex-grow px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={creating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 whitespace-nowrap disabled:opacity-70"
          >
            {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Add Task
          </button>
        </form>
      </div>

      <h2 className="text-3xl font-black mb-6 text-gray-800 dark:text-gray-100">
        {user?.role === 'admin' ? "Company Tasks (Admin View)" : "Your Tasks"}
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-700 border-dashed">
          <p className="text-gray-500 font-medium text-lg">No tasks yet. Create one above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {user?.role === 'admin' ? (
            <>
              <h3 className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-slate-800">Your Tasks</h3>
              {tasks.filter(t => t.userId === user.id).length === 0 && <p className="text-gray-500 italic text-sm">You have no personal tasks.</p>}
              {tasks.filter(t => t.userId === user.id).map(renderTask)}
              
              <h3 className="text-xl font-bold mt-8 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-slate-800">Other Users' Tasks</h3>
              {tasks.filter(t => t.userId !== user.id).length === 0 && <p className="text-gray-500 italic text-sm">No other user tasks exist.</p>}
              {tasks.filter(t => t.userId !== user.id).map(renderTask)}
            </>
          ) : (
            <>
              {tasks.map(renderTask)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
