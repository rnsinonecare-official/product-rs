import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Search,
  Filter,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Activity,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(currentPage, 20, searchTerm);
      setUsers(response.users || mockUsers);
      setTotalPages(response.totalPages || 5);
    } catch (error) {
      console.error('Error loading users:', error);
      // Use mock data for demonstration
      setUsers(mockUsers);
      toast.error('Failed to load users - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleViewUser = async (userId) => {
    try {
      const userDetails = await adminService.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      // Use mock data for demonstration
      const mockUser = mockUsers.find(u => u.id === userId);
      setSelectedUser(mockUser);
      setShowUserModal(true);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminService.deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleExportUsers = async () => {
    try {
      const data = await adminService.exportUserData('csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  // Mock data for demonstration
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-08-17',
      totalSessions: 45,
      profileComplete: 85,
      avatar: null,
      location: 'New York, USA',
      age: 28,
      healthGoals: ['Weight Loss', 'Muscle Gain'],
      subscription: 'Premium'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234 567 8901',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '2024-08-16',
      totalSessions: 32,
      profileComplete: 92,
      avatar: null,
      location: 'Los Angeles, USA',
      age: 32,
      healthGoals: ['Healthy Eating', 'Fitness'],
      subscription: 'Free'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 234 567 8902',
      status: 'inactive',
      joinDate: '2024-03-10',
      lastActive: '2024-07-15',
      totalSessions: 12,
      profileComplete: 45,
      avatar: null,
      location: 'Chicago, USA',
      age: 25,
      healthGoals: ['Weight Loss'],
      subscription: 'Free'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1 234 567 8903',
      status: 'active',
      joinDate: '2024-04-05',
      lastActive: '2024-08-17',
      totalSessions: 67,
      profileComplete: 100,
      avatar: null,
      location: 'Miami, USA',
      age: 29,
      healthGoals: ['Nutrition', 'Mental Health'],
      subscription: 'Premium'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@example.com',
      phone: '+1 234 567 8904',
      status: 'suspended',
      joinDate: '2024-05-12',
      lastActive: '2024-08-10',
      totalSessions: 8,
      profileComplete: 30,
      avatar: null,
      location: 'Seattle, USA',
      age: 35,
      healthGoals: ['Fitness'],
      subscription: 'Free'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExportUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={loadUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Inactive Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center space-x-3">
            <UserX className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-gray-400 text-sm">Suspended</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.status === 'suspended').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.email}</div>
                      <div className="text-sm text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.totalSessions} sessions</div>
                      <div className="text-sm text-gray-400">Last: {user.lastActive}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription === 'Premium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateUserStatus(
                            user.id, 
                            user.status === 'active' ? 'inactive' : 'active'
                          )}
                          className={`p-1 ${
                            user.status === 'active' 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-green-400 hover:text-green-300'
                          }`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400">{selectedUser.email}</p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedUser.status)}`}>
                      {getStatusIcon(selectedUser.status)}
                      <span className="capitalize">{selectedUser.status}</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Contact Information</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{selectedUser.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Account Information</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-white">Joined: {selectedUser.joinDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-white">Last Active: {selectedUser.lastActive}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Profile Completion</label>
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white">{selectedUser.profileComplete}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${selectedUser.profileComplete}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Health Goals</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedUser.healthGoals?.map((goal, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Statistics</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Sessions:</span>
                          <span className="text-white">{selectedUser.totalSessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Subscription:</span>
                          <span className="text-white">{selectedUser.subscription}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-xl font-bold text-white">Delete User</h2>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This action cannot be undone and will permanently remove all user data.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;