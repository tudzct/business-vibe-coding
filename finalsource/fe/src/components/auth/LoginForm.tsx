import { isAxiosError } from 'axios';
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ApiError } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon, EyeIcon, GoogleIcon } from './AuthIcons';

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const requestPending = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestPending.current) return;

    const nextErrors: LoginErrors = {};
    const email = values.email.trim().toLowerCase();
    if (!email) nextErrors.email = 'Email is required';
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address';
    if (!values.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    requestPending.current = true;
    setSubmitting(true);
    try {
      await login({ email, password: values.password });
      navigate('/');
    } catch (error: unknown) {
      if (isAxiosError<ApiError>(error)) {
        setFormError(error.response?.data?.message || 'Login failed');
      } else {
        setFormError(error instanceof Error ? error.message : 'Login failed');
      }
    } finally {
      requestPending.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form className="w-full max-w-[400px]" noValidate onSubmit={submit}>
      <label className="block text-[16px] font-medium leading-6 text-[#191d23]">
        <span>Email Address</span>
        <input
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] bg-transparent px-4 text-[16px] font-normal text-[#4b5768] outline-none transition placeholder:text-[#999da3] focus:border-[#4b5768] focus:ring-1 focus:ring-[#4b5768]"
          name="email"
          placeholder="johndoe@email.com"
          type="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        />
        {errors.email && <span id="login-email-error" className="mt-1 block text-sm font-normal text-[#e73d1c]">{errors.email}</span>}
      </label>

      <label className="mt-6 block text-[16px] font-medium leading-6 text-[#191d23]">
        <span className="flex items-center justify-between">
          <span>Password</span>
          <span className="text-xs font-medium leading-4 text-[#299d91]">Forgot Password?</span>
        </span>
        <span className="relative mt-2 block">
          <input
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className="h-12 w-full rounded-lg border border-[#d0d5dd] bg-transparent px-4 pr-12 text-[16px] font-normal text-[#4b5768] outline-none transition focus:border-[#4b5768] focus:ring-1 focus:ring-[#4b5768]"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <EyeIcon />
          </button>
        </span>
        {errors.password && <span id="login-password-error" className="mt-1 block text-sm font-normal text-[#e73d1c]">{errors.password}</span>}
      </label>

      <button
        aria-pressed={keepSignedIn}
        className="mt-8 flex items-center gap-4 text-left text-[16px] font-light leading-6 text-[#191d23]"
        type="button"
        onClick={() => setKeepSignedIn((checked) => !checked)}
      >
        <span className={`grid size-5 place-items-center rounded-sm border ${keepSignedIn ? 'border-[#299d91] bg-[#299d91]' : 'border-[#999da3] bg-transparent'}`}>
          {keepSignedIn && <CheckIcon />}
        </span>
        Keep me signed in
      </button>

      {formError && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-[#b42318]">{formError}</p>}
      <button className="mt-4 h-12 w-full rounded bg-[#299d91] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#23877d] disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
        {submitting ? 'Logging in…' : 'Login'}
      </button>

      <div className="mt-6 flex items-center gap-4 text-sm font-normal text-[#999da3]"><span className="h-px flex-1 bg-[#d0d5dd]" /><span>or sign in with</span><span className="h-px flex-1 bg-[#d0d5dd]" /></div>
      <button className="mt-6 flex h-12 w-full cursor-default items-center justify-center gap-4 rounded bg-[#e4e7eb] text-[16px] font-normal text-[#4b5768]" type="button" aria-disabled="true">
        <GoogleIcon /> Continue with Google
      </button>
      <p className="mt-10 text-center text-[16px] font-semibold leading-6">
        <Link className="text-[#299d91] hover:underline" to="/register">Create an account</Link>
      </p>
    </form>
  );
}
