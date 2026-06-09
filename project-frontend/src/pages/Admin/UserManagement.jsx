import React, { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  toggleBlockUser 
} from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiShield, FiTrash2, FiSlash, 
  FiCheckCircle, FiStar, FiRefreshCw 
} from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // Factory response handle kar rahe hain
      setUsers(response.users || response.data || []);
    } catch (error) {
      toast.error(error.message || "Users load nahi ho paye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User ab ${newRole} hai!`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Role change fail ho gaya");
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const response = await toggleBlockUser(userId);
      toast.success(response.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Action block ho gaya");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bhai, pakka is user ko udana hai?")) {
      try {
        await deleteUser(userId);
        toast.success("User deleted!");
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        toast.error(error.message || "Deletion fail");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <FiRefreshCw className="animate-spin text-primary-500 text-4xl" />
      <p className="text-gray-500">System scan ho raha hai...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
            <FiShield className="text-red-500" /> Admin Control
          </h2>
          <p className="text-gray-500 mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="font-bold text-primary-600">{users.length}</span> Users Found
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr className="text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-4 px-6">Identity</th>
              <th className="py-4 px-6">Power Level (Role)</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                      user.role === 'owner' ? 'bg-gradient-to-tr from-yellow-500 to-red-500' : 'bg-primary-500'
                    }`}>
                      {user.role === 'owner' ? <FiStar /> : user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                      <p className="text-xs text-gray-500 italic">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={user.role === 'owner'} // Owner ko koi change nahi kar sakta
                    className={`text-sm font-semibold rounded-lg px-3 py-1.5 outline-none border-none cursor-pointer ${
                      user.role === 'owner' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="py-4 px-6">
                  {user.isBlocked ? (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                      <FiSlash size={12} /> BANNED
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                      <FiCheckCircle size={12} /> VERIFIED
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleToggleBlock(user._id)}
                      disabled={user.role === 'owner'} // Owner ko block nahi kar sakte
                      title={user.isBlocked ? "Unblock" : "Block User"}
                      className={`p-2.5 rounded-xl transition-all ${
                        user.role === 'owner' 
                        ? 'opacity-20 cursor-not-allowed' 
                        : 'hover:scale-110 active:scale-95 bg-gray-100 dark:bg-gray-800 text-orange-500'
                      }`}
                    >
                      <FiSlash />
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'owner'} // Owner ko delete nahi kar sakte
                      title="Delete User"
                      className={`p-2.5 rounded-xl transition-all ${
                        user.role === 'owner' 
                        ? 'opacity-20 cursor-not-allowed' 
                        : 'hover:scale-110 active:scale-95 bg-gray-100 dark:bg-gray-800 text-red-500'
                      }`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;