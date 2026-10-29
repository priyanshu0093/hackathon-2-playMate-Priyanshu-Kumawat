import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/common/Logo';

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const finalizeSession = async () => {
      const err = searchParams.get('error');
      if (err) {
        navigate(`/login?error=${encodeURIComponent(err)}`, { replace: true });
        return;
      }

      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok && active) {
          const data = await res.json();
          const user = data.user || data;
          const role = user.role || searchParams.get('role') || 'player';
          const targetPath = role === 'turf_owner' || role === 'owner' ? '/owner' : '/player';
          showToast(
            'Welcome to PlayMate! 🏆',
            `Signed in successfully via Google as ${user.name || 'Player'}.`
          );
          // Navigate to target panel and refresh session
          window.location.href = targetPath;
        } else if (active) {
          setError('Failed to restore session after Google authentication.');
          setTimeout(() => navigate('/login?error=session_restore_failed'), 2000);
        }
      } catch (err) {
        if (active) {
          setError('Connection error restoring Google session.');
          setTimeout(() => navigate('/login?error=connection_error'), 2000);
        }
      }
    };

    finalizeSession();
    return () => {
      active = false;
    };
  }, [navigate, searchParams, showToast]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-gradient-to-b from-[#D9EAFE]/40 via-[#F4F8FD] to-white">
      <div className="bg-white p-8 rounded-3xl border border-[#E5EDF7] shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <Logo to="/" size="md" />
        </div>
        {error ? (
          <div className="space-y-2 text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F80ED] mx-auto" />
            <h3 className="text-sm font-bold text-[#172338]">Finalizing Google Sign-in...</h3>
            <p className="text-xs text-[#687587]">Securing your session and loading your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

