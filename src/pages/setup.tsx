import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/login');
  }, [router]);

  return null;
}
