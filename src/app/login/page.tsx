"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const login = await signIn("email", {
      email,
      redirect: false,
    });
    if (login?.error) {
      return alert(login.error);
    }
    alert("Check your email");
    setShowOTP(true);
  };

  const handleVerifyOTP = async () => {
    const url = new URL("/api/auth/callback/email", window.location.href);
    url.searchParams.append("token", otp);
    url.searchParams.append("email", email);
    const res = await fetch(url);
    if (res.status !== 200) {
      return alert("Invalid OTP");
    }
    alert("Login Successful");
    setShowOTP(false);
    router.replace("/api/auth/session");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-x-2">
        <input
          className="h-10 rounded-lg border border-slate-600 p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="h-10 rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          Send Email
        </button>
      </div>
      {showOTP && (
        <div className="space-x-2">
          <input
            className="h-10 rounded-lg border border-slate-600 p-2"
            type="otp"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          />
          <button
            onClick={handleVerifyOTP}
            className="h-10 rounded-lg bg-slate-800 px-4 py-2 text-white"
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
