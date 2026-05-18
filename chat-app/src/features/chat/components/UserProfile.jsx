import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { logOut, updateUserProfile, resetPassword } from "../../../lib/authService";

export default function UserProfile() {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    try {
      await logOut();
      setShowMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName,
      });
      setMessage("Profile updated successfully");
      setTimeout(() => {
        setShowUpdateModal(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user?.email);
      setMessage("Password reset email sent to " + user?.email);
      setShowMenu(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
          {user?.displayName?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="hidden sm:inline">{user?.displayName || "User"}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <p className="font-semibold text-gray-800">{user?.displayName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              setShowUpdateModal(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={handleResetPassword}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
          >
            Reset Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
          >
            Log Out
          </button>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
