import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import {
  Users,
  Activity,
  TrendingUp,
  Settings,
  Bell,
  FileText,
  BarChart3,
  Shield,
  Database,
  MessageSquare,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Trophy,
  UserCheck,
} from "lucide-react";
import AnimatedSection from "../shared/AnimatedSection";
import PageBackground from "../shared/PageBackground";

const AdminPanel = () => {
  const { user, userProfile } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    avgSessionTime: 0,
  });
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: 1,
    isActive: true,
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showHealthTipsForm, setShowHealthTipsForm] = useState(false);
  const [healthTipForm, setHealthTipForm] = useState({
    title: "",
    content: "",
    category: "General Health",
    isActive: true,
  });
  const [editingHealthTip, setEditingHealthTip] = useState(null);
  const [showSuccessStoryForm, setShowSuccessStoryForm] = useState(false);
  const [successStoryForm, setSuccessStoryForm] = useState({
    title: "",
    content: "",
    author: "",
    isActive: true,
    featured: false,
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    isActive: true,
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    isActive: true,
  });

  // Check if user is admin
  const isAdmin =
    userProfile?.role === "admin" ||
    userProfile?.isAdmin ||
    user?.email === "admin@rainscare.com";

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Admin API headers
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
        "Content-Type": "application/json",
      };

      // Fetch admin statistics
      const statsResponse = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: adminHeaders,
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: adminHeaders,
        }
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch announcements
      const announcementsResponse = await fetch(
        "http://localhost:5000/api/admin/announcements",
        {
          headers: adminHeaders,
        }
      );

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        console.log("Announcements data received:", announcementsData);
        setAnnouncements(announcementsData);
      } else {
        console.error(
          "Failed to fetch announcements:",
          announcementsResponse.status
        );
      }

      // Fetch health tips
      const healthTipsResponse = await fetch(
        "http://localhost:5000/api/admin/health-tips",
        {
          headers: adminHeaders,
        }
      );

      if (healthTipsResponse.ok) {
        const healthTipsData = await healthTipsResponse.json();
        setHealthTips(healthTipsData);
      }

      // Fetch success stories
      const successStoriesResponse = await fetch(
        "http://localhost:5000/api/admin/success-stories",
        {
          headers: adminHeaders,
        }
      );

      if (successStoriesResponse.ok) {
        const successStoriesData = await successStoriesResponse.json();
        setSuccessStories(successStoriesData);
      }

      // Fetch updates
      const updatesResponse = await fetch(
        "http://localhost:5000/api/admin/updates",
        {
          headers: adminHeaders,
        }
      );

      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json();
        setUpdates(updatesData);
      }

      // Fetch doctors
      const doctorsResponse = await fetch(
        "http://localhost:5000/api/admin/doctors",
        {
          headers: adminHeaders,
        }
      );

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Use fallback data for demo
      setStats({
        totalUsers: 1250,
        activeUsers: 342,
        totalSessions: 5680,
        avgSessionTime: 24.5,
      });
      setUsers([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: "2024-01-15",
          lastLogin: "2024-01-20",
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
        "Content-Type": "application/json",
      };

      const url = editingAnnouncement
        ? `http://localhost:5000/api/admin/announcements/${editingAnnouncement.id}`
        : "http://localhost:5000/api/admin/announcements";

      const method = editingAnnouncement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: adminHeaders,
        body: JSON.stringify(announcementForm),
      });

      if (response.ok) {
        const result = await response.json();

        if (editingAnnouncement) {
          // Update existing announcement
          setAnnouncements((prev) =>
            prev.map((ann) =>
              ann.id === editingAnnouncement.id
                ? {
                    ...ann,
                    ...announcementForm,
                    updatedAt: new Date().toISOString(),
                  }
                : ann
            )
          );
          alert("Announcement updated successfully!");
        } else {
          // Add new announcement
          setAnnouncements((prev) => [result, ...prev]);
          alert("Announcement created successfully!");
        }

        // Reset form and close modal
        setAnnouncementForm({
          title: "",
          content: "",
          priority: 1,
          isActive: true,
        });
        setEditingAnnouncement(null);
        setShowAnnouncementForm(false);
      } else {
        const errorData = await response.json();
        console.error("Announcement operation failed:", errorData);
        alert(
          `Failed to ${editingAnnouncement ? "update" : "create"} announcement: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error("Error with announcement:", error);
      alert("Error with announcement");
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      isActive: announcement.isActive,
    });
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
      };

      const response = await fetch(
        `http://localhost:5000/api/admin/announcements/${id}`,
        {
          method: "DELETE",
          headers: adminHeaders,
        }
      );

      if (response.ok) {
        setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
        alert("Announcement deleted successfully!");
      } else {
        alert("Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement");
    }
  };

  const handleCreateSuccessStory = async (e) => {
    e.preventDefault();
    
    try {
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
        "Content-Type": "application/json",
      };

      const response = await fetch(
        "http://localhost:5000/api/admin/success-stories",
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify(successStoryForm),
        }
      );

      if (response.ok) {
        const newSuccessStory = await response.json();
        setSuccessStories(prev => [newSuccessStory, ...prev]);
        setSuccessStoryForm({
          title: "",
          content: "",
          author: "",
          isActive: true,
          featured: false,
        });
        setShowSuccessStoryForm(false);
        alert("Success story created successfully!");
      } else {
        alert("Failed to create success story");
      }
    } catch (error) {
      console.error("Error creating success story:", error);
      alert("Error creating success story");
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Sending update data:", updateForm);
      
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
        "Content-Type": "application/json",
      };

      const response = await fetch(
        "http://localhost:5000/api/admin/updates",
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify(updateForm),
        }
      );

      if (response.ok) {
        const newUpdate = await response.json();
        setUpdates(prev => [newUpdate, ...prev]);
        setUpdateForm({
          title: "",
          content: "",
          isActive: true,
        });
        setShowUpdateForm(false);
        alert("Update created successfully!");
      } else {
        const errorData = await response.json();
        console.error("Update creation failed:", errorData);
        alert(`Failed to create update: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating update:", error);
      alert("Error creating update");
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Sending doctor data:", doctorForm);
      
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
        "Content-Type": "application/json",
      };

      const response = await fetch(
        "http://localhost:5000/api/admin/doctors",
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify(doctorForm),
        }
      );

      if (response.ok) {
        const newDoctor = await response.json();
        setDoctors(prev => [newDoctor, ...prev]);
        setDoctorForm({
          name: "",
          specialty: "",
          email: "",
          phone: "",
          isActive: true,
        });
        setShowDoctorForm(false);
        alert("Doctor created successfully!");
      } else {
        const errorData = await response.json();
        console.error("Doctor creation failed:", errorData);
        alert(`Failed to create doctor: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      alert("Error creating doctor");
    }
  };

  const handleExportData = async (format = "json", type = "all") => {
    try {
      const adminHeaders = {
        "x-admin-api-key":
          process.env.REACT_APP_ADMIN_API_KEY || "rainscare_admin_key_2024",
      };

      const response = await fetch(
        `http://localhost:5000/api/admin/export/${type}`,
        {
          headers: adminHeaders,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rainscare-export-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`Data exported successfully as ${format.toUpperCase()}!`);
      } else {
        alert("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "health-tips", label: "Health Tips", icon: FileText },
    { id: "success-stories", label: "Success Stories", icon: Trophy },
    { id: "updates", label: "Updates", icon: RefreshCw },
    { id: "doctors", label: "Doctors", icon: UserCheck },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageBackground variant="auth" />
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Shield size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
    >
      <PageBackground variant="dashboard" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Panel
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your Rainscare platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExportData("json", "all")}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download size={16} />
                  <span>Export All</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchAdminData}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </motion.button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Navigation Tabs */}
        <AnimatedSection className="mb-8">
          <div className="glass-card p-2 rounded-xl">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={Users}
                  color="bg-blue-500"
                  change={12}
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers.toLocaleString()}
                  icon={Activity}
                  color="bg-green-500"
                  change={8}
                />
                <StatCard
                  title="Total Sessions"
                  value={stats.totalSessions.toLocaleString()}
                  icon={Database}
                  color="bg-purple-500"
                  change={15}
                />
                <StatCard
                  title="Avg Session Time"
                  value={`${stats.avgSessionTime}min`}
                  icon={Calendar}
                  color="bg-orange-500"
                  change={-3}
                />
              </div>

              {/* Recent Activity */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          New user registered
                        </p>
                        <p className="text-gray-600 text-sm">2 minutes ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  User Management
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add User</span>
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Edit size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "announcements" && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Announcements
                </h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportData("json", "announcements")}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAnnouncementForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>New Announcement</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {console.log("Current announcements state:", announcements)}
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No announcements yet</p>
                    <p className="text-gray-500 text-sm">
                      Create your first announcement to engage with users
                    </p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {announcement.title}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {announcement.content}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Edit announcement"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleDeleteAnnouncement(announcement.id)
                            }
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete announcement"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Announcement Form Modal */}
              {showAnnouncementForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setShowAnnouncementForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {editingAnnouncement
                        ? "Edit Announcement"
                        : "Create New Announcement"}
                    </h3>

                    <form
                      onSubmit={handleCreateAnnouncement}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={announcementForm.title}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter announcement title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={announcementForm.content}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter announcement content"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={announcementForm.priority}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              priority: parseInt(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={1}>High Priority</option>
                          <option value={2}>Medium Priority</option>
                          <option value={3}>Low Priority</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={announcementForm.isActive}
                          onChange={(e) =>
                            setAnnouncementForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-sm text-gray-700"
                        >
                          Active (visible to users)
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAnnouncementForm(false);
                            setEditingAnnouncement(null);
                            setAnnouncementForm({
                              title: "",
                              content: "",
                              priority: 1,
                              isActive: true,
                            });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {editingAnnouncement
                            ? "Update Announcement"
                            : "Create Announcement"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Success Story Form Modal */}
              {showSuccessStoryForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setShowSuccessStoryForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Create New Success Story
                    </h3>

                    <form onSubmit={handleCreateSuccessStory} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={successStoryForm.title}
                          onChange={(e) =>
                            setSuccessStoryForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter story title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={successStoryForm.content}
                          onChange={(e) =>
                            setSuccessStoryForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter story content"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          value={successStoryForm.author}
                          onChange={(e) =>
                            setSuccessStoryForm((prev) => ({
                              ...prev,
                              author: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Anonymous User"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="storyActive"
                            checked={successStoryForm.isActive}
                            onChange={(e) =>
                              setSuccessStoryForm((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="storyActive" className="text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={successStoryForm.featured}
                            onChange={(e) =>
                              setSuccessStoryForm((prev) => ({
                                ...prev,
                                featured: e.target.checked,
                              }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="featured" className="text-sm text-gray-700">
                            Featured
                          </label>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuccessStoryForm(false);
                            setSuccessStoryForm({
                              title: "",
                              content: "",
                              author: "",
                              isActive: true,
                              featured: false,
                            });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create Story
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Doctor Form Modal */}
              {showDoctorForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setShowDoctorForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Add New Doctor
                    </h3>

                    <form onSubmit={handleCreateDoctor} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={doctorForm.name}
                          onChange={(e) =>
                            setDoctorForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter doctor's name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialty
                        </label>
                        <input
                          type="text"
                          required
                          value={doctorForm.specialty}
                          onChange={(e) =>
                            setDoctorForm((prev) => ({
                              ...prev,
                              specialty: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Cardiology, General Medicine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={doctorForm.email}
                          onChange={(e) =>
                            setDoctorForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="doctor@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={doctorForm.phone}
                          onChange={(e) =>
                            setDoctorForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1234567890"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="doctorActive"
                          checked={doctorForm.isActive}
                          onChange={(e) =>
                            setDoctorForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label htmlFor="doctorActive" className="text-sm text-gray-700">
                          Active (available for consultations)
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDoctorForm(false);
                            setDoctorForm({
                              name: "",
                              specialty: "",
                              email: "",
                              phone: "",
                              isActive: true,
                            });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add Doctor
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Update Form Modal */}
              {showUpdateForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setShowUpdateForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Create New Update
                    </h3>

                    <form onSubmit={handleCreateUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={updateForm.title}
                          onChange={(e) =>
                            setUpdateForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter update title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={updateForm.content}
                          onChange={(e) =>
                            setUpdateForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter update content"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="updateActive"
                          checked={updateForm.isActive}
                          onChange={(e) =>
                            setUpdateForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label htmlFor="updateActive" className="text-sm text-gray-700">
                          Active (visible to users)
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUpdateForm(false);
                            setUpdateForm({
                              title: "",
                              content: "",
                              isActive: true,
                            });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create Update
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "health-tips" && (
            <motion.div
              key="health-tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Health Tips</h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportData("json", "healthTips")}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHealthTipsForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>New Health Tip</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {healthTips.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText
                      size={48}
                      className="text-gray-400 mx-auto mb-4"
                    />
                    <p className="text-gray-600">No health tips yet</p>
                    <p className="text-gray-500 text-sm">
                      Create your first health tip to help users
                    </p>
                  </div>
                ) : (
                  healthTips.map((tip) => (
                    <div key={tip.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {tip.title}
                            </h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tip.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{tip.content}</p>
                          <p className="text-gray-500 text-sm mt-2">
                            {new Date(tip.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Edit health tip"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete health tip"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "success-stories" && (
            <motion.div
              key="success-stories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Success Stories
                </h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportData('json', 'successStories')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSuccessStoryForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>New Success Story</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {successStories.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No success stories yet</p>
                    <p className="text-gray-500 text-sm">
                      Create your first success story to inspire users
                    </p>
                  </div>
                ) : (
                  successStories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {story.title}
                            </h4>
                            {story.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">
                            {story.content}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-gray-500 text-sm">
                              By: {story.author}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {new Date(story.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                              ❤️ {story.likes} likes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Edit success story"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete success story"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "updates" && (
            <motion.div
              key="updates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Updates
                </h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportData('json', 'updates')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUpdateForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>New Update</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {updates.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No updates yet</p>
                    <p className="text-gray-500 text-sm">
                      Create your first update to keep users informed
                    </p>
                  </div>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {update.title}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {update.content}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-gray-500 text-sm">
                              {new Date(update.createdAt).toLocaleDateString()}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              update.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {update.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Edit update"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete update"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "doctors" && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Doctors
                </h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportData('json', 'doctors')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDoctorForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>New Doctor</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No doctors yet</p>
                    <p className="text-gray-500 text-sm">
                      Add your first doctor to the platform
                    </p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {doctor.name}
                            </h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {doctor.specialty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-gray-600 text-sm">
                              📧 {doctor.email}
                            </p>
                            <p className="text-gray-600 text-sm">
                              📞 {doctor.phone}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Added: {new Date(doctor.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Edit doctor"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete doctor"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Analytics Overview */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Analytics Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value="1,250"
                    icon={Users}
                    color="bg-blue-500"
                    change="+12%"
                  />
                  <StatCard
                    title="Active Users"
                    value="890"
                    icon={Activity}
                    color="bg-green-500"
                    change="+8%"
                  />
                  <StatCard
                    title="Total Sessions"
                    value="3,420"
                    icon={TrendingUp}
                    color="bg-purple-500"
                    change="+15%"
                  />
                  <StatCard
                    title="Avg Session Time"
                    value="4m 45s"
                    icon={BarChart3}
                    color="bg-orange-500"
                    change="+3%"
                  />
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h4>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">User Growth Chart</p>
                      <p className="text-gray-500 text-sm">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>

                {/* Content Engagement Chart */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Content Engagement</h4>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Content Engagement Chart</p>
                      <p className="text-gray-500 text-sm">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Content */}
              <div className="glass-card p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Content</h4>
                <div className="space-y-4">
                  {[
                    { title: "Welcome to Rainscare", type: "Announcement", views: 156, engagement: "High" },
                    { title: "Stay Hydrated", type: "Health Tip", views: 142, engagement: "High" },
                    { title: "My Health Journey", type: "Success Story", views: 98, engagement: "Medium" },
                    { title: "System Update", type: "Update", views: 76, engagement: "Medium" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{item.title}</h5>
                        <p className="text-gray-600 text-sm">{item.type}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-800">{item.views}</p>
                          <p className="text-gray-500 text-xs">Views</p>
                        </div>
                        <div className="text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.engagement === 'High' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.engagement}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
