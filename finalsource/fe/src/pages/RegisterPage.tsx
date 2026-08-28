import { SignUpForm } from '../components/auth/SignUpForm';

export function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 pb-16 pt-20 sm:pt-[108px]">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center">
        <div className="font-['Poppins',Inter,sans-serif] text-[40px] font-extrabold leading-8 tracking-[3.2px] text-[#299d91]">FINE<span className="font-medium">bank.</span>IO</div>
        <h1 className="mb-10 mt-10 text-[26px] font-bold leading-8 text-[#191d23]">Create an account</h1>
        <SignUpForm />
      </div>
    </main>
  );
}
