"use client";

import { useEffect, useState } from "react";
import { fetchUsers, toggleUserStatus, verifyDriver } from "@/app/lib/api/adminActions.js";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {Home} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleToggle = async (_id) => {
    try {
      await toggleUserStatus(_id);
      // Optimistically update UI
      setUsers(users.map(user => 
        user._id === _id ? { ...user, isBlocked: !user.isBlocked } : user
      ));
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      // Revert changes if the API call fails
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    }
  };

  const handleVerify = async (_id) => {
    try {
      await verifyDriver(_id);
      // Optimistically update UI
      setUsers(users.map(user => 
        user._id === _id ? { ...user, isVerified: true } : user
      ));
    } catch (error) {
      console.error("Failed to verify driver:", error);
      // Revert changes if the API call fails
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "blocked") return matchesSearch && user.isBlocked;
    if (activeFilter === "unverified-drivers") return matchesSearch && user.role === "driver" && !user.isVerified;
    
    return matchesSearch && user.role === activeFilter;
  });

  // TableRow skeleton for loading state
  const TableRowSkeleton = ({ count = 5 }) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                <Skeleton circle height={40} width={40} />
              </div>
              <div className="ml-4 w-24">
                <Skeleton height={20} />
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={150} height={20} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={80} height={24} borderRadius={20} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <Skeleton width={80} height={24} borderRadius={20} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex justify-end space-x-2">
              <Skeleton width={70} height={36} borderRadius={8} />
              <Skeleton width={70} height={36} borderRadius={8} />
            </div>
          </td>
        </tr>
      ));
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Users
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          
          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="driver">Drivers</option>
            <option value="user">Regular Users</option>
            <option value="blocked">Blocked Users</option>
            <option value="unverified-drivers">Unverified Drivers</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <TableRowSkeleton count={6} />
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : user.role === "driver"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Blocked
                        </span>
                      ) : user.role === "driver" && !user.isVerified ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Unverified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                            user.isBlocked
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                          onClick={() => handleToggle(user._id)}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        {user.role === "driver" && !user.isVerified && (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                            onClick={() => handleVerify(user._id)}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="5" 
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => window.location.href = '/'}
        className="fixed bottom-6 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 z-10"
        aria-label="Go to home"
      >
        <Home size={24} />
      </button>
      
      {!loading && (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
