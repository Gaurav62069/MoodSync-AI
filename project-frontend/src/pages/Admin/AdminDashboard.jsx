import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Trash2, Plus, ShieldCheck, Activity, Users, Search, 
  List, Crown, Shield, Lock, Unlock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/UI/ConfirmModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'users'
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', action: null, type: 'danger' });

  // Task Form State
  const [taskForm, setTaskForm] = useState({ title: '', mood: 'happy', type: 'mental' });
  const [searchTerm, setSearchTerm] = useState('');

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      if (activeTab === 'tasks') {
        const { data } = await api.get('/admin/tasks');
        // Backend se agar { data: [...] } aa raha hai to data.data, warna data
        setTasks(data.data || data); 
      } else {
        const { data } = await api.get('/admin/users');
        // 👇 MAIN FIX: Backend { users: [...] } bhej raha hai, isliye data.users use karein
        setUsers(data.users || []); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // --- ACTIONS ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/tasks', taskForm);
      toast.success('Task Added');
      setTaskForm({ ...taskForm, title: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  // Generic Confirmation Handler
  const confirmAction = (title, message, action, type = 'danger') => {
    setModalConfig({ title, message, action, type });
    setModalOpen(true);
  };

  const executeDeleteTask = async (id) => {
    try { await api.delete(`/admin/tasks/${id}`); toast.success('Deleted'); fetchData(); } 
    catch { toast.error('Failed'); }
  };

  const executeRoleChange = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try { await api.put(`/admin/users/${user._id}/role`, { role: newRole }); toast.success(`Role: ${newRole}`); fetchData(); } 
    catch { toast.error('Failed'); }
  };

  const executeBlockUser = async (user) => {
    try { await api.put(`/admin/users/${user._id}/block`); toast.success(user.isBlocked ? 'Unblocked' : 'Blocked'); fetchData(); } 
    catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-6 animate-fadeIn">
      
      {/* 0. BRANDING HEADER (Logo & Name) */}
      <div className="flex items-center gap-3 mb-2 opacity-90">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            MOODSYNC AI
          </span>
          <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
            Super Admin
          </span>
        </h2>
      </div>

      {/* 1. PAGE TITLE & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Control Center</h1>
            <p className="text-gray-400 text-sm">Manage users, tasks, and system health.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-2"><List size={16}/> Tasks</div>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
             <div className="flex items-center gap-2"><Users size={16}/> Users</div>
          </button>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL (Task Form - Only Visible in Task Tab) */}
        {activeTab === 'tasks' && (
          <div className="lg:col-span-4">
            <div className="bg-[#121212]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Plus className="text-blue-500"/> Create New Task
              </h3>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
                  <input 
                    type="text" 
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none mt-1"
                    placeholder="Enter task details..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mood</label>
                    <select 
                      value={taskForm.mood}
                      onChange={(e) => setTaskForm({...taskForm, mood: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mt-1 cursor-pointer"
                    >
                      {['happy', 'sad', 'angry', 'anxious', 'bored'].map(m => <option key={m} value={m} className="bg-gray-900">{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Type</label>
                    <select 
                      value={taskForm.type}
                      onChange={(e) => setTaskForm({...taskForm, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mt-1 cursor-pointer"
                    >
                      {['mental', 'physical', 'social'].map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                    </select>
                  </div>
                </div>

                <button disabled={loading} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                  {loading ? 'Adding...' : 'Add to Database'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RIGHT PANEL (List/Table) */}
        <div className={`${activeTab === 'tasks' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-[#121212]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[600px]">
            
            {/* Search & Stats Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {activeTab === 'tasks' ? <Activity className="text-green-500"/> : <Users className="text-blue-500"/>}
                {activeTab === 'tasks' ? 'Task Library' : 'User Database'}
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                  {/* Safe check for length */}
                  {activeTab === 'tasks' ? (tasks?.length || 0) : (users?.length || 0)}
                </span>
              </h2>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-500"/>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-white/20 outline-none w-48 md:w-64"
                />
              </div>
            </div>

            {/* --- TASK LIST --- */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {Array.isArray(tasks) && tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((task) => (
                  <div key={task._id} className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        task.mood === 'happy' ? 'bg-yellow-500/10 text-yellow-500' : 
                        task.mood === 'sad' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                         {task.mood === 'happy' ? '😊' : task.mood === 'sad' ? '😔' : '😐'}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-400">{task.mood}</span>
                          <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-400">{task.type}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => confirmAction('Delete Task?', 'This action cannot be undone.', () => executeDeleteTask(task._id))}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* --- USER TABLE --- */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/10">
                      <th className="pb-4 pl-4">User</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Safe Filtering for Users */}
                    {Array.isArray(users) && users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                      <tr key={user._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            {/* 👇 NEW: PROFILE PICTURE LOGIC */}
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 relative flex-shrink-0">
                               {user.profilePicture && user.profilePicture !== 'default-avatar.png' ? (
                                  <img 
                                    src={user.profilePicture} 
                                    alt={user.username} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null; 
                                      e.target.style.display = 'none'; // Hide broken image
                                      e.target.nextSibling.style.display = 'flex'; // Show fallback
                                    }}
                                  />
                               ) : null}
                               
                               {/* Fallback Initials (Hidden if image loads) */}
                               <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-inner absolute top-0 left-0 ${user.profilePicture && user.profilePicture !== 'default-avatar.png' ? '-z-10' : ''}`}>
                                  {user.username.charAt(0).toUpperCase()}
                               </div>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium">{user.username}</p>
                              <p className="text-gray-500 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {user.role === 'owner' ? (
                             <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 flex w-fit items-center gap-1">
                               <Crown size={10} fill="currentColor"/> OWNER
                             </span>
                          ) : user.role === 'admin' ? (
                             <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded border border-blue-500/20">ADMIN</span>
                          ) : (
                             <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">USER</span>
                          )}
                        </td>
                        <td className="py-4">
                           {user.isBlocked ? (
                             <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 flex w-fit gap-1 items-center"><Lock size={10}/> BLOCKED</span>
                           ) : (
                             <span className="text-xs text-green-500 flex w-fit gap-1 items-center"><Unlock size={10}/> ACTIVE</span>
                           )}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          {user.role !== 'owner' && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => confirmAction('Change Role?', `Make ${user.username} a ${user.role === 'admin' ? 'User' : 'Admin'}?`, () => executeRoleChange(user), 'info')}
                                className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors text-gray-400"
                              >
                                <Shield size={16}/>
                              </button>
                              <button 
                                onClick={() => confirmAction(user.isBlocked ? 'Unblock User?' : 'Block User?', `Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.username}?`, () => executeBlockUser(user))}
                                className={`p-2 bg-white/5 rounded-lg transition-colors ${user.isBlocked ? 'hover:bg-green-500/20 hover:text-green-400 text-red-400' : 'hover:bg-red-500/20 hover:text-red-400 text-gray-400'}`}
                              >
                                {user.isBlocked ? <Unlock size={16}/> : <Lock size={16}/>}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* MODAL COMPONENT */}
      <ConfirmModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.action}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

    </div>
  );
};

export default AdminDashboard;