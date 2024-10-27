'use client';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Home, LogIn } from 'lucide-react';
import Google from '@/public/logos/google.svg';
import Twitter from '@/public/logos/x.svg';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import GmailLogo from '@/public/logos/gmail.svg';
import Loading from '@/components/loading';
import Logo from '@/public/logo.svg';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://autovit.vercel.app'
  : 'http://localhost:3000';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/');
      }
      setLoadingUser(false);
    };
    checkUser();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${BASE_URL}/`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Magic link sent! Please check your email.");
      setIsEmailSent(true);
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: "google" | "twitter") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${BASE_URL}/`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  if (loadingUser) {
    return <Loading />;
  }

  return (
    <main>
      <Toaster richColors position='top-right' />
      <div className='flex justify-center items-center h-screen'>
        <Link href="/" className="absolute top-8 left-8">
          <Button variant="ghost">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
        <Link href="/signup" className="absolute top-8 right-8">
          <Button variant="ghost">
            <LogIn className="h-4 w-4 mr-2" />
            Nu ai cont?
          </Button>
        </Link>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <Image priority quality={10} src={Logo} alt="AutoScout Logo" className="mx-auto mb-12" width={200} height={40} />
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 mb-4">Logare</h2>
            <p className="text-center text-sm text-gray-500">Logheaza-te cu unul din urmatoarele servicii</p>
            <div className='flex flex-col gap-2 mt-6'>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
              >
                <Image className="h-4 w-4 mr-2" src={Google} alt="Google Logo" />
                Continua cu Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("twitter")}
                disabled={loading}
              >
                <Image className="h-4 w-4 mr-2" src={Twitter} alt="Twitter Logo" />
                Continua cu Twitter
              </Button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">sau</span>
              </div>
            </div>
            <form onSubmit={handleEmailLogin} className='flex flex-col mb-12'>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="john@doe.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className='mt-1 mb-4'
              />
              {isEmailSent ? (
                <Button type="submit" className="w-full" disabled>
                  Verifica-ti email-ul
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-[#007bff] text-white" disabled={loading}>
                  {loading ? "Se trimite link-ul..." : "Trimite link de logare"}
                </Button>
              )}
              {isEmailSent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={openGmail}
                >
                  <div className="flex items-center justify-center mr-2.5">
                    <Image className="h-5 w-5" src={GmailLogo} alt="Gmail Logo" />
                  </div>
                  Deschide Gmail
                  <ExternalLink className="w-4 ml-2" />
                </Button>
              )}
            </form>
            <p className="mt-10 text-left text-xs opacity-60">
              Prin logare, esti de acord cu <span className='hover:underline text-[#007bff] cursor-pointer'>Termenii si Conditiile</span> si <span className="hover:underline text-[#007bff] cursor-pointer">Politica de Confidentialitate</span>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}