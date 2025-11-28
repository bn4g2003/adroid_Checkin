import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDb } from '../lib/firebaseClient';
import { User, Lock } from 'lucide-react';
import { useToast } from '../components/ui/useToast';

export default function EmployeeLoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { database, ref, get } = await getDb();
      const employeesRef = ref(database, `employees/${employeeId.toUpperCase()}`);
      const snapshot = await get(employeesRef);

      if (snapshot.exists()) {
        const employeeData = snapshot.val();
        
        // Kiểm tra password
        const storedPassword = employeeData.password || '123456'; // Mặc định là 123456 nếu chưa có
        if (storedPassword === password) {
          if (employeeData.active !== false) {
            localStorage.setItem('employeeSessionId', employeeId.toUpperCase());
            localStorage.setItem('employeeSessionName', employeeData.fullName);
            addToast({ type: 'success', message: `Welcome, ${employeeData.fullName}!` });
            navigate('/'); // Redirect to CheckinPage
          } else {
            addToast({ type: 'error', message: 'Your account is inactive. Please contact HR.' });
          }
        } else {
          addToast({ type: 'error', message: 'Invalid password.' });
        }
      } else {
        addToast({ type: 'error', message: 'Employee ID not found.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast({ type: 'error', message: 'An error occurred during login. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="relative backdrop-blur-2xl bg-white/90 border border-white/40 rounded-3xl shadow-2xl overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 pointer-events-none" />
          
          <div className="relative space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm mt-2">Sign in to continue</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <User size={16} className="mr-1"/>Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., NV001"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <Lock size={16} className="mr-1"/>Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative backdrop-blur-xl bg-gradient-to-br from-blue-500 to-purple-600 border border-white/30 rounded-2xl shadow-xl p-4 text-white font-bold disabled:opacity-50 active:scale-95 transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-2xl" />
              <span className="relative">{loading ? 'Logging in...' : 'Login'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
