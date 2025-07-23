"use client";

import { useLocalAuth } from "@/components/auth/LocalAuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LoginPromptBubble() {
  const { user } = useLocalAuth();
  const pathname = usePathname();
  if (user) return null;
  if (pathname === "/auth/login" || pathname === "/auth/register") return null;
  return (
    <Link href="/auth/login" className="fixed bottom-8 left-8 z-50 bg-white border-4 border-brand-blue shadow-2xl px-6 py-4 rounded-2xl text-brand-blue font-bold text-lg flex items-center gap-3 animate-bounce hover:bg-brand-blue hover:text-white transition-colors duration-200" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.25)'}}>
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M15.75 9V5.75A2.75 2.75 0 0 0 13 3H6.75A2.75 2.75 0 0 0 4 5.75v12.5A2.75 2.75 0 0 0 6.75 21H13a2.75 2.75 0 0 0 2.75-2.75V15"/><path stroke="currentColor" strokeWidth="2" d="M18 12h-9m9 0-2.5-2.5M18 12l-2.5 2.5"/></svg>
      LOGIN TO ACCESS MORE FEATURES
    </Link>
  );
} 