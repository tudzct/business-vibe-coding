import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toSafeApiFailure } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

interface FormValues { fullName: string; email: string; password: string; confirmPassword: string }
type FormErrors = Partial<Record<keyof FormValues | 'form', string>>;

const initialValues: FormValues = { fullName: '', email: '', password: '', confirmPassword: '' };
const fullNamePattern = /^\p{L}+(?: \p{L}+)*$/u;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPasswordPattern = /^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$/;
const specialPasswordPattern = /[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;]/;

export function SignUpForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const normalized = { ...values, fullName: values.fullName.normalize('NFC').trim(), email: values.email.trim().toLowerCase() };
    const validation = validate(normalized);
    if (Object.keys(validation).length > 0) { setErrors(validation); return; }
    setValues(normalized);
    setSubmitting(true);
    try {
      await register(normalized);
      navigate('/');
    } catch (error: unknown) {
      const failure = toSafeApiFailure(error);
      setErrors(failure.statusCode === 409 ? { email: failure.message } : { form: failure.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="w-full" noValidate onSubmit={submit}>
      <Field id="fullName" label="Name" value={values.fullName} error={errors.fullName} autoComplete="name" onChange={(value) => update('fullName', value)} />
      <Field id="email" label="Email Address" type="email" value={values.email} error={errors.email} autoComplete="email" placeholder="hello@example.com" onChange={(value) => update('email', value)} />
      <Field id="password" label="Password" type={showPassword ? 'text' : 'password'} value={values.password} error={errors.password} autoComplete="new-password" onChange={(value) => update('password', value)} trailing={<VisibilityButton visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />} />
      <Field id="confirmPassword" label="Confirm password" type={showPassword ? 'text' : 'password'} value={values.confirmPassword} error={errors.confirmPassword} autoComplete="new-password" onChange={(value) => update('confirmPassword', value)} />

      <p className="mt-5 text-sm text-slate-500">By continuing, you agree to our <span className="font-medium text-teal-600">terms of service.</span></p>
      {errors.form ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p> : null}
      <button className="mt-5 h-12 w-full rounded bg-[#299d91] font-semibold text-white transition hover:bg-[#238a80] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
        {submitting ? 'Signing up…' : 'Sign up'}
      </button>

      <div className="my-9 flex items-center gap-4 text-sm text-slate-400" aria-hidden="true"><span className="h-px flex-1 bg-slate-300" /><span>or sign up with</span><span className="h-px flex-1 bg-slate-300" /></div>
      <button className="flex h-12 w-full cursor-default items-center justify-center gap-3 rounded bg-slate-200 text-slate-600" disabled type="button" aria-label="Continue with Google is unavailable">
        <span className="grid size-6 place-items-center rounded-full bg-white font-bold text-[#4285f4]">G</span>Continue with Google
      </button>
      <p className="mt-10 text-center text-slate-400">Already have an account? <span className="font-semibold text-[#299d91]">Sign in here</span></p>
    </form>
  );
}

interface FieldProps {
  id: keyof FormValues;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete: string;
  placeholder?: string;
  trailing?: React.ReactNode;
  onChange: (value: string) => void;
}

function Field({ id, label, value, error, type = 'text', autoComplete, placeholder, trailing, onChange }: Readonly<FieldProps>) {
  const errorId = `${id}-error`;
  return (
    <div className="mb-6">
      <label className="mb-2 block text-base text-slate-900" htmlFor={id}>{label}</label>
      <div className="relative">
        <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} autoComplete={autoComplete} className="h-12 w-full rounded-lg border border-slate-300 bg-transparent px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-600 focus:ring-1 focus:ring-slate-600" id={id} name={id} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
        {trailing}
      </div>
      {error ? <p className="mt-1.5 text-sm text-red-600" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

function VisibilityButton({ visible, onToggle }: Readonly<{ visible: boolean; onToggle: () => void }>) {
  return <button aria-label={visible ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 my-auto grid size-8 place-items-center text-slate-400 hover:text-slate-600" onClick={onToggle} type="button"><span aria-hidden="true" className="text-lg">{visible ? '◉' : '◎'}</span></button>;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const fullNameLength = Array.from(values.fullName).length;
  if (!values.fullName) errors.fullName = 'Name is required';
  else if (fullNameLength < 4 || fullNameLength > 25 || !fullNamePattern.test(values.fullName)) errors.fullName = 'Use 4–25 letters separated by single spaces';
  if (!values.email) errors.email = 'Email is required';
  else if (values.email.length > 255 || !emailPattern.test(values.email)) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8 || values.password.length > 64) errors.password = 'Password must be 8–64 characters';
  else if (/\s/.test(values.password)) errors.password = 'Password must not contain whitespace';
  else if (!allowedPasswordPattern.test(values.password)) errors.password = 'Password contains a character that is not permitted';
  else if (!/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password) || !specialPasswordPattern.test(values.password)) errors.password = 'Include lowercase, uppercase, number, and special characters';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}
