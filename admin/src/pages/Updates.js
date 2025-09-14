import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Clock, Zap, Heart, Award, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'app',
    icon: 'Zap',
    color: 'blue',
    isActive: true
  });

  const updateTypes = [
    { value: 'app', label: 'App Update', icon: 'Zap', defaultColor: 'blue' },
    { value: 'health', label: 'Health Tip', icon: 'Heart', defaultColor: 'green' },
    { value: 'community', label: 'Community', icon: 'Award', defaultColor: 'purple' },
    { value: 'feature', label: 'New Feature', icon: 'Zap', defaultColor: 'indigo' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Info', defaultColor: 'yellow' }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'from-blue-500 to-blue-600' },
    { value: 'green', label: 'Green', class: 'from-green-500 to-green-600' },
    { value: 'purple', label: 'Purple', class: 'from-purple-500 to-purple-600' },
    { value: 'red', label: 'Red', class: 'from-red-500 to-red-600' },
    { value: 'yellow', label: 'Yellow', class: 'from-yellow-500 to-yellow-600' },
    { value: 'indigo', label: 'Indigo', class: 'from-indigo-500 to-indigo-600' },
    { value: 'pink', label: 'Pink', class: 'from-pink-500 to-pink-600' },
    { value: 'orange', label: 'Orange', class: 'from-orange-500 to-orange-600' }
  ];

  const iconOptions = [
    { value: 'Zap', label: 'Lightning', component: Zap },
    { value: 'Heart', label: 'Heart', component: Heart },
    { value: 'Award', label: 'Award', component: Award },
    { value: 'Info', label: 'Info', component: Info },
    { value: 'Calendar', label: 'Calendar', component: Calendar },
    { value: 'Clock', label: 'Clock', component: Clock }
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const data = await adminService.getUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast.error('Failed to fetch updates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUpdate) {
        await adminService.updateUpdate(editingUpdate.id, formData);
        toast.success('Update updated successfully!');
      } else {
        await adminService.createUpdate(formData);
        toast.success('Update created successfully!');
      }

      setShowForm(false);
      setEditingUpdate(null);
      setFormData({
        title: '',
        description: '',
        type: 'app',
        icon: 'Zap',
        color: 'blue',
        isActive: true
      });
      fetchUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
      toast.error('Failed to save update');
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      description: update.description,
      type: update.type,
      icon: update.icon,
      color: update.color,
      isActive: update.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await adminService.deleteUpdate(id);
        toast.success('Update deleted successfully!');
        fetchUpdates();
      } catch (error) {
        console.error('Error deleting update:', error);
        toast.error('Failed to delete update');
      }
    }
  };

  const toggleStatus = async (update) => {
    try {
      await adminService.updateUpdate(update.id, {
        ...update,
        isActive: !update.isActive
      });
      toast.success(`Update ${!update.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchUpdates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredUpdates = updates.filter(update =>
    update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.component : Zap;
  };

  const getColorClass = (colorName) => {
    const colorOption = colorOptions.find(option => option.value === colorName);
    return colorOption ? colorOption.class : 'from-blue-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Updates Management</h1>
          <p className="text-gray-400">Manage platform updates and announcements</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingUpdate(null);
            setFormData({
              title: '',
              description: '',
              type: 'app',
              icon: 'Zap',
              color: 'blue',
              isActive: true
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Update</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <input
          type="text"
          placeholder="Search updates..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Updates List */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">All Updates ({filteredUpdates.length})</h3>
          
          {filteredUpdates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No updates found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUpdates.map((update) => {
                const IconComponent = getIconComponent(update.icon);
                const colorClass = getColorClass(update.color);
                
                return (
                  <div
                    key={update.id}
                    className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-white truncate">
                              {update.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              update.isActive 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {update.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 mb-2 line-clamp-2">
                            {update.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="capitalize">{update.type}</span>
                            <span>•</span>
                            <span>
                              {update.createdAt?.toDate ? 
                                update.createdAt.toDate().toLocaleDateString() : 
                                'Recently'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleStatus(update)}
                          className={`p-2 rounded-lg transition-colors ${
                            update.isActive
                              ? 'text-green-400 hover:bg-green-900/30'
                              : 'text-gray-500 hover:bg-gray-600'
                          }`}
                          title={update.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {update.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(update)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {editingUpdate ? 'Edit Update' : 'Add New Update'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={formData.type}
                  onChange={(e) => {
                    const selectedType = updateTypes.find(type => type.value === e.target.value);
                    setFormData({
                      ...formData, 
                      type: e.target.value,
                      icon: selectedType?.icon || 'Zap',
                      color: selectedType?.defaultColor || 'blue'
                    });
                  }}
                >
                  {updateTypes.map(type => (
                    <option key={type.value} value={type.value} className="bg-gray-700 text-white">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Icon
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon.value} value={icon.value} className="bg-gray-700 text-white">
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Color
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value} className="bg-gray-700 text-white">
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  {editingUpdate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Updates;