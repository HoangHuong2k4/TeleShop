import { useState } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Login successful!')
        localStorage.setItem('token', data.token)
      } else {
        setMessage(data.message || 'Login failed')
      }
    } catch (error) {
      setMessage('Error connecting to server')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TeleShop Admin
          </h1>
          <p className="text-gray-400">Hệ thống quản lý Bot SaaS chuyên nghiệp</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900/50 border border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
              placeholder="admin@teleshop.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400 ml-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-gray-900/50 border border-gray-600 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] transform"
          >
            Đăng nhập
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('successful') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản? <span className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition-colors">Đăng ký ngay</span>
        </div>
      </div>
      
      <p className="mt-8 text-gray-600 text-xs">© 2026 TeleShop SaaS. Built with ❤️ for your business.</p>
    </div>
  )
}

export default App
