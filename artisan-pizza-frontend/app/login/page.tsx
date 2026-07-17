'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Pizza,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-orange-500 flex">

      {/* Left Side */}
      <div className="hidden lg:flex flex-1 items-center justify-center text-white p-16 relative overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-72 w-72 rounded-full bg-white -top-20 -left-20" />
          <div className="absolute h-96 w-96 rounded-full bg-white bottom-0 right-0" />
        </div>

        <div className="relative max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <Pizza className="h-12 w-12" />
            <h1 className="text-5xl font-extrabold">
              Artisan Pizza
            </h1>
          </div>

          <p className="text-xl text-red-100 leading-relaxed">
            Restaurant Management System designed for
            fast, efficient, and seamless ordering,
            inventory, and kitchen operations.
          </p>

          <div className="mt-10 space-y-4 text-red-100">
            <div>✔ POS Ordering</div>
            <div>✔ Inventory Tracking</div>
            <div>✔ Kitchen Management</div>
            <div>✔ Sales Analytics</div>
          </div>
        </div>
      </div>

      {/* Login */}
      <div className="flex-1 flex items-center justify-center p-6">

        <div className="w-full max-w-md">

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10">

            <div className="text-center mb-8">

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <Pizza className="h-10 w-10 text-red-700" />
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>

              <p className="text-gray-500 mt-2">
                Sign in to continue
              </p>

            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email Address
                </label>

                <div className="mt-2 relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Password
                </label>

                <div className="mt-2 relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 pl-12 pr-12 py-3 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-600 py-3 font-semibold text-red-700 hover:bg-red-50 transition mt-4"
            >
              <UserPlus className="h-5 w-5" />
              Create an Account
            </Link>

            <div className="mt-8 text-center text-sm text-gray-500">
              © 2026 Artisan Pizza Management System
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}