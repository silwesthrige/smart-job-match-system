import { Bell, Search, User, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getMe } from "../../api";

export function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-8">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] rounded-full flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "Job Seeker"}</p>
              <p className="text-xs text-gray-500">{user ? "Authenticated" : "Not logged in"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
