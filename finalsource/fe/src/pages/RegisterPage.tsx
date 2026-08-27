import { SignUpForm } from '../components/auth/SignUpForm';

export function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 py-12 text-[#171b26] sm:py-20">
      <section aria-labelledby="register-heading" className="mx-auto w-full max-w-[400px]">
        <div className="mb-7 text-center text-[40px] font-bold leading-none tracking-wide text-[#299d91]">FINEbank.IO</div>
        <h1 className="mb-10 text-center text-2xl font-bold" id="register-heading">Create an account</h1>
        <SignUpForm />
      </section>
    </main>
  );
}
