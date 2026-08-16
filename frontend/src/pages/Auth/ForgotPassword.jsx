import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import Input from '../../components/Field/Input.jsx';
import Button from '../../components/Button/Button.jsx';
import * as authService from '../../services/auth.service.js';
import { required, isEmail, runValidators } from '../../utils/validators.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = runValidators({ email: () => required(email, 'Email') || isEmail(email) });
    if (found.email) {
      setError(found.email);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<><Link to="/login" className="auth__link">Back to log in</Link></>}
    >
      {sent ? (
        <div className="auth__success" role="status">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
          Check your inbox.
        </div>
      ) : (
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" fullWidth loading={submitting}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
