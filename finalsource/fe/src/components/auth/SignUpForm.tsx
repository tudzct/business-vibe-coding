import { isAxiosError } from 'axios';
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ApiError } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, GoogleIcon } from './AuthIcons';

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { fullName: '', email: '', password: '', confirmPassword: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fullNamePattern = /^[\p{L}]+(?: [\p{L}]+)*$/u;
const passwordAllowedCharacters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}_-+=[],./<>?\\|:;');
const passwordSpecialCharacters = new Set('!@#$%^&*(){}_-+=[],./<>?\\|:;');

export function SignUpForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const requestPending = useRef(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const normalizedName = values.fullName.normalize('NFC').trim();
    if (!normalizedName) next.fullName = 'Full name is required';
    else if (normalizedName.length < 4 || normalizedName.length > 25 || !fullNamePattern.test(normalizedName)) {
      next.fullName = 'Use 4–25 letters with single spaces';
    }
    if (!values.email.trim()) next.email = 'Email is required';
    else if (values.email.trim().toLowerCase().length > 255) next.email = 'Email must be 255 characters or fewer';
    else if (!emailPattern.test(values.email.trim().toLowerCase())) next.email = 'Enter a valid email address';
    if (!values.password) next.password = 'Password is required';
    else if (values.password.length < 8 || values.password.length > 64) next.password = 'Password must be 8–64 characters';
    else if (/\s/.test(values.password)) next.password = 'Password cannot contain whitespace';
    else if (!/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password) || ![...values.password].some((character) => passwordSpecialCharacters.has(character))) {
      next.password = 'Use uppercase, lowercase, number and special character';
    } else if (![...values.password].every((character) => passwordAllowedCharacters.has(character))) next.password = 'Password contains an unsupported character';
    if (!values.confirmPassword) next.confirmPassword = 'Confirm your password';
    else if (values.confirmPassword !== values.password) next.confirmPassword = 'Passwords do not match';
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestPending.current) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    requestPending.current = true;
    setSubmitting(true);
    try {
      await register({
        fullName: values.fullName.normalize('NFC').trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      navigate('/');
    } catch (error: unknown) {
      if (isAxiosError<ApiError>(error)) {
        setFormError(error.response?.data?.message || 'Registration failed');
      } else {
        setFormError(error instanceof Error ? error.message : 'Registration failed');
      }
    } finally {
      requestPending.current = false;
      setSubmitting(false);
    }
  };

  const field = (name: keyof FormValues, label: string, type = 'text', placeholder = '') => (
    <label className="block text-[16px] font-medium leading-6 text-[#191d23]">
      <span>{label}</span>
      <span className="relative mt-2 block">
        <input
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          className="h-12 w-full rounded-lg border border-[#d0d5dd] bg-transparent px-4 pr-12 text-[16px] font-normal text-[#4b5768] outline-none transition placeholder:text-[#999da3] focus:border-[#4b5768] focus:ring-1 focus:ring-[#4b5768]"
          name={name}
          placeholder={placeholder}
          type={name === 'password' || name === 'confirmPassword' ? (showPassword ? 'text' : 'password') : type}
          value={values[name]}
          onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
        />
        {(name === 'password' || name === 'confirmPassword') && (
          <button
            aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
            className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center text-[#999da3]"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <EyeIcon />
          </button>
        )}
      </span>
      {errors[name] && <span id={`${name}-error`} className="mt-1 block text-sm font-normal text-[#e73d1c]">{errors[name]}</span>}
    </label>
  );

  return (
    <form className="w-full max-w-[400px]" noValidate onSubmit={submit}>
      <div className="space-y-6">
        {field('fullName', 'Name', 'text', 'Tanzir Rahman')}
        {field('email', 'Email Address', 'email', 'hello@example.com')}
        {field('password', 'Password')}
        {field('confirmPassword', 'Confirm password')}
      </div>
      <p className="mt-8 text-sm font-normal leading-5 text-[#737b8c]">By continuing, you agree to our <span className="text-[#299d91]">terms of service.</span></p>
      {formError && <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-[#b42318]">{formError}</p>}
      <button className="mt-5 h-12 w-full rounded bg-[#299d91] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#23877d] disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
        {submitting ? 'Signing up…' : 'Sign up'}
      </button>
      <div className="mt-6 flex items-center gap-4 text-sm font-normal text-[#999da3]"><span className="h-px flex-1 bg-[#d0d5dd]" /><span>or sign up with</span><span className="h-px flex-1 bg-[#d0d5dd]" /></div>
      <button className="mt-6 flex h-12 w-full cursor-default items-center justify-center gap-4 rounded bg-[#e4e7eb] text-[16px] font-normal text-[#4b5768]" type="button" aria-disabled="true">
        <GoogleIcon /> Continue with Google
      </button>
      <p className="mt-10 text-center text-[16px] font-light leading-6 text-[#999da3]">Already have an account?{' '}
        <Link className="font-semibold text-[#299d91] hover:underline" to="/login">Sign in here</Link>
      </p>
    </form>
  );
}
