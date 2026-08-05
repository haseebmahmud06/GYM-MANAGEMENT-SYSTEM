/**
 * GoogleButton component for "Sign in with Google".
 *
 * Uses Google Identity Services (GIS) to obtain a Google ID token in the
 * browser, then sends it to the backend `/auth/google/` endpoint. The backend
 * verifies the token, retrieves/creates the user, and returns JWT tokens so the
 * user is authenticated automatically.
 *
 * The Google client ID is injected at build time via the VITE_GOOGLE_CLIENT_ID
 * environment variable. When it is not configured, the button is hidden so the
 * app keeps working without Google OAuth set up.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

// The Google client ID read from the Vite build environment.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');

// Minimal type declaration for the Google Identity Services global.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            el: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              width?: string;
              text?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleButtonProps {
  /** Called instead of the built-in redirect when provided (e.g. inline auth). */
  onSuccess?: () => void;
  /** Compact styling for forms. */
  size?: 'default' | 'lg';
}

export default function GoogleButton({ onSuccess, size = 'lg' }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If Google is not configured, render nothing.
  if (!GOOGLE_ENABLED) return null;

  useEffect(() => {
    if (!GOOGLE_ENABLED || !containerRef.current || !window.google) return;

    // Initialise the Google Identity Services ID provider. On successful
    // credential receipt we exchange it with our backend for JWT tokens.
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID as string,
      callback: async (resp: { credential: string }) => {
        setLoading(true);
        try {
          const { data } = await authApi.googleLogin(resp.credential);
          // Store tokens + user via the shared auth store.
          useAuthStore.getState().setAuth(data.user, data.tokens);
          toast.success(data.created ? 'Account created with Google!' : 'Welcome back!');
          if (onSuccess) onSuccess();
          else navigate('/dashboard');
        } catch (err: any) {
          toast.error(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
        } finally {
          setLoading(false);
        }
      },
    });

    // Render the branded Google button into the container.
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: size === 'lg' ? 'large' : 'medium',
      shape: 'rectangular',
    });
  }, [navigate, onSuccess, size]);

  return (
    <div className="space-y-2">
      <div className="relative flex items-center justify-center">
        <span className="text-xs text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wide">
          Or continue with
        </span>
      </div>
      {/* The GIS library injects the Google button into this element. */}
      <div ref={containerRef} className="flex justify-center" />
      {loading && <Button className="w-full" disabled>Signing in with Google...</Button>}
    </div>
  );
}
