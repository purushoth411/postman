import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import { useAuth } from "../utils/idb.jsx";
import { motion, AnimatePresence } from "framer-motion";




DataTable.use(DT);

export default function Users() {
  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState(
    user.fld_admin_type == "SUPERADMIN"
      ? "EXECUTIVE"
      : user.fld_admin_type || "EXECUTIVE"
  );
  const [userCount, setUserCount] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchAllUsers();
    getUserCount();
  }, []);

  useEffect(() => {
    // Filter users based on selected type
    const filtered = allUsers.filter(user => user.fld_admin_type === selectedUserType);
    setFilteredUsers(filtered);
  }, [selectedUserType, allUsers]);

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      const filters = {
        usertype: [], // Fetch all user types
        keyword: "",
      };

      const response = await fetch(
        "http://localhost:5000/api/users/getallusers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        }
      );

      const result = await response.json();
      if (result.status) {
        setAllUsers(result.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/getusercount', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.status) {
        setUserCount(result.data);
        console.log("User count fetched successfully:", result.data);
      } else {
        console.error("Failed to fetch user count:", result.message);
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).toLowerCase();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SUSPENDED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full border';
    const statusClass = statusClasses[status] || statusClasses['PENDING'];
    
    return `<span class="${baseClasses} ${statusClass}">${status}</span>`;
  };

  const columns = [
    { 
      title: "Name", 
      data: "fld_name",
      orderable: true,
      render: (data) => `<div class="font-medium text-gray-900">${data || ''}</div>`
    },
    { 
      title: "Username", 
      data: "fld_username",
      orderable: true,
      render: (data) => `<div class="text-gray-600">${data || ''}</div>`
    },
    { 
      title: "Email", 
      data: "fld_email",
      orderable: true,
      render: (data) => `<div class="text-blue-600">${data || ''}</div>`
    },
    { 
      title: "Type", 
      data: "fld_admin_type",
      orderable: true,
      render: (data) => `<div class="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-md inline-block">${data || ''}</div>`
    },
    { 
      title: "Added On", 
      data: "fld_addedon",
      orderable: true,
      render: (data) => `<div class="text-gray-500 text-sm">${formatDate(data)}</div>`
    },
    { 
      title: "Status", 
      data: "status",
      orderable: true,
      render: (data) => getStatusBadge(data)
    }
  ];

  const userTabs = [
    { key: "EXECUTIVE", label: "CRM", count: userCount.EXECUTIVE || 0, color: "blue" },
    { key: "SUBADMIN", label: "SUBADMIN", count: userCount.SUBADMIN || 0, color: "purple" },
    { key: "CONSULTANT", label: "CONSULTANT", count: userCount.CONSULTANT || 0, color: "green" },
    { key: "OPERATIONSADMIN", label: "OPS ADMIN", count: userCount.OPERATIONSADMIN || 0, color: "orange" },
  ];

  const handleTabClick = (userType) => {
    setSelectedUserType(userType);
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 rounded flex-1"></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        {Array(8).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-100">
            <div className="flex space-x-4">
              {Array(6).fill(0).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Pagination Skeleton */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-300 rounded w-48"></div>
            <div className="flex space-x-2">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="h-8 w-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

const executiveUsers = allUsers.filter(u => u.fld_admin_type === 'EXECUTIVE');
const subadminUsers = allUsers.filter(u => u.fld_admin_type === 'SUBADMIN');
const consultantUsers = allUsers.filter(u => u.fld_admin_type === 'CONSULTANT');
const opsAdminUsers = allUsers.filter(u => u.fld_admin_type === 'OPERATIONSADMIN');
const tableOptions = {
  responsive: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  order: [[0, 'asc']],
  dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
  language: {
    search: "",
    searchPlaceholder: "Search users...",
    lengthMenu: "Show _MENU_ entries",
    info: "Showing _START_ to _END_ of _TOTAL_ entries",
    infoEmpty: "No entries available",
    infoFiltered: "(filtered from _MAX_ total entries)"
  },
  drawCallback: function () {
    const container = $(this.api().table().container());
    container.find('input[type="search"]').addClass('form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm');
    container.find('select').addClass('form-select px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm');
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-3xl font-bold text-gray-900">User Management</h4>
          
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <nav className="flex space-x-1">
              {userTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedUserType === tab.key
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.label}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUserType === tab.key
                        ? "bg-blue-400 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {tab.count}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {userTabs.find(tab => tab.key === selectedUserType)?.label} Users
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isLoading ? '...' : filteredUsers.length}
                </span>
              </div>
              <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    + Add CRM
                </button>
                </div>
            </div>
          </div>

          {/* Table Content */}
          {/* Table Content */}
<div className="p-6">
  {isLoading ? (
    <SkeletonLoader />
  ) : (
    <div className="overflow-hidden">
      {selectedUserType === "EXECUTIVE" && (
        <DataTable
          data={executiveUsers}
          columns={columns}
          className="display table table-auto w-full"
          options={tableOptions}
        />
      )}
      {selectedUserType === "SUBADMIN" && (
        <DataTable
          data={subadminUsers}
          columns={columns}
          className="display table table-auto w-full"
          options={tableOptions}
        />
      )}
      {selectedUserType === "CONSULTANT" && (
        <DataTable
          data={consultantUsers}
          columns={columns}
          className="display table table-auto w-full"
          options={tableOptions}
        />
      )}
      {selectedUserType === "OPERATIONSADMIN" && (
        <DataTable
          data={opsAdminUsers}
          columns={columns}
          className="display table table-auto w-full"
          options={tableOptions}
        />
      )}
    </div>
  )}
</div>



        </div>
        <AnimatePresence>
  {showForm && (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add CRM</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Form Fields */}
        <div>
          <label className="block mb-1 font-medium">Select Team</label>
          <select className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            <option value="Team A">Team A</option>
            <option value="Team B">Team B</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input type="text" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input type="text" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      </div>
      
      {/* Custom Styles */}
    
    </div>
  );
}
