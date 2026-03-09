"use client";

import { useState, useRef } from "react";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function SignupForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    
    const formData = new FormData(e.currentTarget);
    
    if (!validatePasswords()) {
      // Only clear password fields, preserve other fields
      setPassword("");
      setConfirmPassword("");
      
      // Clear only password inputs in the form
      if (formRef.current) {
        const passwordInput = formRef.current.querySelector('#password') as HTMLInputElement;
        const confirmPasswordInput = formRef.current.querySelector('#confirm_password') as HTMLInputElement;
        if (passwordInput) passwordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
      }
      return;
    }
    // Call the server action
    signup(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="full_name"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
        >
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Juan Dela Cruz"
            className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
        >
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
        >
          Password
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-1.5 ml-1 mt-1">
          <CheckCircle2 className="h-3 w-3 text-zinc-300" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">6+ characters required</p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm_password"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
        >
          Re-enter your password
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            className={`pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium ${
              passwordError ? "border-red-300 focus:border-red-500" : ""
            }`}
            minLength={6}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            required
          />
        </div>
        {passwordError && (
          <div className="flex items-center gap-1.5 ml-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{passwordError}</p>
          </div>
        )}
        {!passwordError && password && confirmPassword && password === confirmPassword && (
          <div className="flex items-center gap-1.5 ml-1 mt-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Passwords match</p>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 rounded-2xl mt-6 mb-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-800"
        disabled={!!passwordError}
      >
        Get Started →
      </Button>
    </form>
  );
}
