import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common';
import api from '../../utils/api';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, verifyToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const provider = searchParams.get('provider');
        const error = searchParams.get('message');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth/login?error=' + encodeURIComponent(error));
          return;
        }

        if (!token || !userStr) {
          navigate('/auth/login?error=Invalid callback data');
          return;
        }

        const user = JSON.parse(decodeURIComponent(userStr));
        const userData = { ...user, token, provider };

        // Temporarily store to allow API calls
        localStorage.setItem('user', JSON.stringify(userData));

        // Verify token with backend immediately
        try {
          const { data: verifiedUser } = await api.get('/auth/me');

          // Use verified data from server (more secure)
          const secureUserData = {
            ...verifiedUser,
            token,
            provider
          };

          // Store verified user info
          localStorage.setItem('user', JSON.stringify(secureUserData));
          setUser(secureUserData);

          // Redirect based on verified role from server
          if (verifiedUser.role === 'developer') {
            navigate('/developer');
          } else if (verifiedUser.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Default to client dashboard for client role
            navigate('/dashboard/client');
          }
        } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/auth/login?error=Token verification failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth/login?error=Processing failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="text-gray-400 mt-4">Verifying your login...</p>
      </div>
    </div>
  );
}
