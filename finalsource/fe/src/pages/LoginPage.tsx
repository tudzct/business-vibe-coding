import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 pb-16 pt-24 sm:pt-40">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center">
        <div className="font-['Poppins',Inter,sans-serif] text-[40px] font-extrabold leading-8 tracking-[3.2px] text-[#299d91]">FINE<span className="font-medium">bank.</span>IO</div>
        <div className="mt-16 w-full">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
