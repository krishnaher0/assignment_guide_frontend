# Frontend reCAPTCHA Implementation

## Quick Start Guide

### Step 1: Get reCAPTCHA Keys

1. Go to: https://www.google.com/recaptcha/admin/create
2. Select **reCAPTCHA v3**
3. Add domains: `localhost`, `127.0.0.1`
4. Copy your **Site Key** and **Secret Key**

### Step 2: Install Package

```bash
cd coursework_frontend
npm install react-google-recaptcha-v3
```

### Step 3: Add Environment Variable

Create/update `.env` in `coursework_frontend/`:

```bash
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

### Step 4: Update Main App File

**File**: `src/main.jsx` or wherever you have your root component

```jsx
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// ... existing imports ...

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      language="en"
    >
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>
);
```

### Step 5: Update OAuthLogin Component

**File**: `src/pages/auth/OAuthLogin.jsx`

Add import at the top:
```jsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
```

Add state and reCAPTCHA hook:
```jsx
export default function AuthLogin() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [needsCaptcha, setNeedsCaptcha] = useState(false);

  // ... existing code ...
}
```

Update `handleEmailLogin`:
```jsx
const handleEmailLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    let captchaToken = null;

    // Execute reCAPTCHA if we've detected it's needed
    if (executeRecaptcha) {
      try {
        captchaToken = await executeRecaptcha('login');
      } catch (captchaError) {
        console.error('reCAPTCHA error:', captchaError);
      }
    }

    const response = await login(
      formData.email,
      formData.password,
      captchaToken
    );

    // Check if MFA is required
    if (response.mfaRequired) {
      setMfaStep(true);
      setTempUserId(response.userId);
      setLoading(false);
      return;
    }

    // Redirect based on role
    if (response.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (response.role === 'developer') {
      navigate('/developer');
    } else {
      navigate('/dashboard/client');
    }
  } catch (err) {
    const errorData = err.response?.data;

    // Check if CAPTCHA is specifically required
    if (errorData?.requiresCaptcha) {
      setNeedsCaptcha(true);
      setError('Security verification required. Please try again.');
    } else {
      setError(errorData?.message || 'Login failed. Please check your credentials.');
    }
  } finally {
    setLoading(false);
  }
};
```

### Step 6: Update AuthContext

**File**: `src/context/AuthContext.jsx`

Update login function signature:
```jsx
const login = async (email, password, captchaToken = null) => {
  const { data } = await api.post('/auth/login', {
    email,
    password,
    captchaToken  // Pass captcha token to backend
  });

  console.log('[AuthContext] Login response:', data);

  // Check for intermediate MFA step
  if (data.mfaRequired) {
    return {
      mfaRequired: true,
      userId: data.userId,
      message: data.message
    };
  }

  localStorage.setItem('user', JSON.stringify(data));
  setUser(data);
  setVerified(true);
  return data;
};
```

## Testing

### Test Normal Login (No CAPTCHA)
1. Login with correct credentials
2. Should work without any CAPTCHA

### Test CAPTCHA Trigger
1. Fail login 3 times intentionally
2. 4th attempt should automatically include reCAPTCHA
3. reCAPTCHA runs invisibly in background
4. Login should work if legitimate

### Check Browser Console
You should see:
```
reCAPTCHA executed
Token generated: 03...
```

## Troubleshooting

### reCAPTCHA not loading
1. Check site key is correct in `.env`
2. Check domain is whitelisted in Google admin
3. Disable ad blockers
4. Check browser console for errors

### "Invalid site key" error
- Site key in frontend `.env` doesn't match Google admin
- Check you're using the Site Key (not Secret Key)

### Still getting "CAPTCHA required" error
- Clear browser cache
- Try incognito mode
- Check backend logs for actual error

## Complete Example

See the backend documentation at:
`coursework_backend/RECAPTCHA_SETUP.md`

For a complete implementation guide with all details.
