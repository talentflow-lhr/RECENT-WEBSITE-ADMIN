import { useState } from 'react';
import logoImage from 'figma:asset/59d793a5637be5743b4000eaed07893258073d54.png';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Mission statement */}
        <div className="space-y-6 text-center md:text-left">
          <img src={logoImage} alt="Logo" className="w-32 h-32 mx-auto md:mx-0" />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-green-800">
              Welcome to Admin Portal
            </h1>
            <p className="text-xl text-gray-700">
              Showing the right people at the right place at the right time
            </p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-green-600">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800">LOGIN</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
