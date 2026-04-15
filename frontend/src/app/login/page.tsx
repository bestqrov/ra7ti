'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Bus } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('manager@ra7ti.com');
  const [password, setPassword] = useState('Manager@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      // Demo mode: bypass auth for preview
      localStorage.setItem('ra7ti_token', 'demo-token');
      localStorage.setItem('ra7ti_user', JSON.stringify({
        id: 'demo', name: 'Atlas Manager', email: 'manager@ra7ti.com',
        role: 'COMPANY_ADMIN', companyId: 'co-1',
      }));
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col w-[480px] bg-sidebar p-12 relative overflow-hidden shrink-0">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-96 h-96 rounded-full border border-white"
              style={{ left: `${(i % 3) * 120 - 80}px`, top: `${Math.floor(i / 3) * 120 - 80}px` }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Ra7ti</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center border border-brand-500/30">
                <Bus className="h-7 w-7 text-brand-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white leading-tight">
                  Manage your fleet,<br />
                  <span className="text-brand-400">grow your business.</span>
                </h2>
                <p className="mt-4 text-white/50 text-sm leading-relaxed">
                  Ra7ti gives transport companies a single command center to manage buses, trips, bookings, and revenue analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Companies', value: '120+' },
              { label: 'Daily Trips', value: '1,800' },
              { label: 'Passengers', value: '94k' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Ra7ti</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign in to your company dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 p-4 bg-gray-100 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-gray-600 font-mono">
              <p>manager@ra7ti.com</p>
              <p>Manager@1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
