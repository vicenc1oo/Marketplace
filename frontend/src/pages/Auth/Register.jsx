import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import Input from '../../components/Field/Input.jsx';
import Button from '../../components/Button/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import {
  required,
  isEmail,
  isStrongPassword,
  matches,
  minLength,
  runValidators,
} from '../../utils/validators.js';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = runValidators({
      name: () => required(form.name, 'Name') || minLength(form.name, 2, 'Name'),
      email: () => required(form.email, 'Email') || isEmail(form.email),
      password: () => required(form.password, 'Password') || isStrongPassword(form.password),
      confirm: () => required(form.confirm, 'Confirmation') || matches(form.confirm, form.password, 'Passwords'),
    });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message || 'Could not create your account.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join to buy, sell and message other people locally."
      footer={<>Already have an account? <Link to="/login" className="auth__link">Log in</Link></>}
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {errors.form && <div className="auth__error" role="alert">{errors.form}</div>}
        <Input label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} required />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters with upper, lower case and a number."
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
          required
        />
        <Button type="submit" fullWidth loading={submitting}>Create account</Button>
      </form>
      <p className="auth__hint">
        By signing up you agree to our{' '}
        <Link to="/terms" className="auth__link">Terms</Link> and{' '}
        <Link to="/privacy" className="auth__link">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}
