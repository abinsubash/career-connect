import { useState } from "react";
import { Link } from "react-router-dom";
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
    <path d="M2 12h20"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col"
    >
      {/* Decorative top bar */}
      <div className="h-1 flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" />

      {/* Nav */}
      <nav className="flex-shrink-0 px-6 py-3 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <BriefcaseIcon />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            Career<span className="text-blue-600">Connect</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-sm text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Find Jobs</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Companies</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Salary Guide</a>
        </div>
      </nav>

      {/* Main — fills remaining height, no overflow */}
      <main className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

            {/* Card Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-5 pb-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-4 w-20 h-20 bg-white/10 rounded-full" />
              <p className="text-blue-200 text-xs font-medium mb-0.5 relative z-10 tracking-widest uppercase">Welcome back</p>
              <h1 className="text-white text-2xl font-bold relative z-10 leading-snug">
                Sign in to your account
              </h1>
              <p className="text-blue-200 text-xs mt-1 relative z-10">
                Your next opportunity is waiting
              </p>
            </div>

            <div className="px-6 py-5">
              {/* Google OAuth */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <GoogleIcon />
                <span className="group-hover:text-blue-700 transition-colors">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-slate-400 text-xs font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className={`relative rounded-xl border-2 transition-all duration-200 ${focused === "email" ? "border-blue-500 shadow-sm shadow-blue-100" : "border-slate-200"}`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className={`relative rounded-xl border-2 transition-all duration-200 ${focused === "password" ? "border-blue-500 shadow-sm shadow-blue-100" : "border-slate-200"}`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 accent-blue-600 rounded" />
                  <label htmlFor="remember" className="text-sm text-slate-600 select-none">Keep me signed in</label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Signup redirect */}
              <p className="text-center text-sm text-slate-500 mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                  Create account
                </Link>
                
              </p>

              {/* Footer note */}
              <p className="text-center text-xs text-slate-400 mt-3">
                By signing in, you agree to our{" "}
                <a href="#" className="underline hover:text-slate-600">Terms</a>{" "}
                &{" "}
                <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}