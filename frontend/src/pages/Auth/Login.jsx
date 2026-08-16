import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import Input from '../../components/Field/Input.jsx';
import Button from '../../components/Button/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { required, isEmail, runValidators } from '../../utils/validators.js';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = runValidators({
      email: () => required(form.email, 'Email') || isEmail(form.email),
      password: () => required(form.password, 'Password'),
    });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ form: err.message || 'Invalid email or password.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your listings and messages."
      footer={<>Don't have an account? <Link to="/register" className="auth__link">Sign up</Link></>}
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {errors.form && <div className="auth__error" role="alert">{errors.form}</div>}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          required
        />
        <div className="auth__row">
          <span />
          <Link to="/forgot-password" className="auth__link">Forgot password?</Link>
        </div>
        <Button type="submit" fullWidth loading={submitting}>Log in</Button>
      </form>
      <p className="auth__hint">Demo mode: any email and password will sign you in.</p>
    </AuthShell>
  );
}
