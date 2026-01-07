"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MapWrapper from '@/components/MapWrapper';
import ImageUploader from '@/components/ImageUploader';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function ReportPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [description, setDescription] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto-fill contact info if logged in
    useEffect(() => {
        if (user?.phoneNumber) {
            // Remove +91 or other non-digits for display
            setContactInfo(user.phoneNumber.replace(/^\+91/, '').replace(/\D/g, ''));
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!file || !location || !description || !contactInfo) {
            alert("All fields are mandatory. Please provide an image, description, contact info, and location.");
            return;
        }

        // Validate Contact Info (Strictly 10 digits)
        if (contactInfo.length !== 10) {
            alert("Please enter a valid 10-digit Phone Number.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("description", description);
        // Prepend +91 for backend consistency
        formData.append("contact_info", "+91" + contactInfo);
        if (user) {
            formData.append("reporter_uid", user.uid);
        }
        formData.append("lat", location.lat.toString());
        formData.append("lng", location.lng.toString());

        try {
            const res = await fetch("http://localhost:8000/items/report", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Item Reported Successfully!");
                router.push("/");
            } else {
                alert("Failed to report item.");
                console.error(await res.text());
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to format phone number input (Only numbers, max 10)
    const handleContactChange = (val: string) => {
        const numericVal = val.replace(/\D/g, '').slice(0, 10);
        setContactInfo(numericVal);
    };


    return (
        <main className="min-h-screen p-8 bg-brand-cream flex flex-col items-center relative">
            <LanguageSwitcher />
            {/* Nav Header */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-8">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-black font-medium transition-colors">
                    &larr; {t('report.back')}
                </button>
                <div className="w-8"></div>
            </div>

            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold mb-2 text-black">{t('report.title')}</h1>
                <p className="text-gray-500 mb-8">{t('card.found.desc')}</p>

                <div className="space-y-8">
                    {/* Step 1: Image */}
                    <div>
                        <label className="block text-lg font-bold text-black mb-3">{t('report.step1')} <span className="text-red-500">*</span></label>
                        <ImageUploader onFileSelect={setFile} />
                    </div>

                    {/* Step 2: Description */}
                    <div>
                        <label className="block text-lg font-bold text-black mb-3">{t('report.step3')} <span className="text-red-500">*</span></label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-orange focus:border-transparent text-black outline-none transition-all resize-none"
                            rows={4}
                            placeholder={t('report.descPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Step 3: Contact Info */}
                    <div>
                        <label className="block text-lg font-bold text-black mb-3">{t('report.contactLabel')} <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>
                            <input
                                type="tel"
                                value={contactInfo}
                                onChange={(e) => handleContactChange(e.target.value)}
                                placeholder="98765 43210"
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-orange focus:border-transparent text-black outline-none transition-all font-medium text-lg tracking-widest"
                            />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Enter 10-digit mobile number only.</p>
                    </div>

                    {/* Step 4: Location */}
                    <div>
                        <label className="block text-lg font-bold text-black mb-3">{t('report.step2')} <span className="text-red-500">*</span></label>
                        <div className="h-[400px] border-2 border-dashed border-gray-200 rounded-2xl p-2 bg-gray-50">
                            <MapWrapper onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg shadow-brand-orange/20 transition-transform hover:scale-[1.01] active:scale-[0.99] ${loading ? "bg-gray-300 cursor-not-allowed hidden" : "bg-brand-orange hover:bg-orange-600"
                            }`}
                    >
                        {loading ? t('report.uploading') : t('report.submit')}
                    </button>
                    {loading && <p className="text-center text-brand-orange font-bold animate-pulse">Processing your report...</p>}
                </div>
            </div>
        </main>
    );
}
