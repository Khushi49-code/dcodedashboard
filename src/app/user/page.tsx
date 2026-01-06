"use client";
import React, { useEffect, useState } from "react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users");
        const data = await res.json();
        
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="p-6">
        <div className="text-center">No users found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Firebase Users</h1>
        <p className="text-gray-600">Total Users: {users.length}</p>
      </div>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.uid} className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
              
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Name:</strong> {user.displayName || "N/A"}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email || "N/A"}
                  </div>
                  <div>
                    <strong>UID:</strong> 
                    <span className="font-mono text-xs ml-1">{user.uid}</span>
                  </div>
                  <div>
                    <strong>Email Verified:</strong> {user.emailVerified ? "✅ Yes" : "❌ No"}
                  </div>
                  <div>
                    <strong>Account Status:</strong> {user.disabled ? "❌ Disabled" : "✅ Active"}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(user.creationTime).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Last Sign In:</strong> {user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : "Never"}
                  </div>
                  <div>
                    <strong>Providers:</strong> {user.providerData.map(p => p.providerId).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;