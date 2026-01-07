"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    };

    const handleSendOtp = async () => {
        if (!phoneNumber) return;
        setLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            // Format phone number (dummy logic, assumes user types full E.164 or local)
            // Ideally, use a phone input library. For now, assume user types "+1..."
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep("OTP");
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Error sending OTP. Make sure phone number is in +CountryCode format.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || !confirmationResult) return;
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            router.push("/");
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">
                        {step === "PHONE" ? "Welcome Back" : "Verify Number"}
                    </h1>
                    <p className="text-gray-500">
                        {step === "PHONE" ? "Login to connect with finders." : "Enter the code sent to your phone."}
                    </p>
                </div>

                {step === "PHONE" ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1 555 555 5555"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all font-medium text-lg placeholder:text-gray-300 text-black"
                            />
                            <p className="text-xs text-gray-400 mt-2 px-1">Include country code (e.g. +1, +91)</p>
                        </div>
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-orange/20"
                        >
                            {loading ? "Sending Code..." : "Continue"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">One-Time Password</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all font-medium text-lg tracking-widest text-center placeholder:text-gray-300 text-black"
                            />
                        </div>
                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-orange/20"
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                        <button
                            onClick={() => setStep("PHONE")}
                            className="w-full text-gray-400 text-sm hover:text-gray-600 font-medium"
                        >
                            Wrong number? Go back
                        </button>
                    </div>
                )}
                <div id="recaptcha-container"></div>
            </div>
        </main>
    );
}

// Add types for window
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}
