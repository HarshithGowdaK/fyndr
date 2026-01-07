"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/utils/translations';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'ka', label: 'ಕನ್ನಡ' },
    ];

    return (
        <div className="absolute top-4 right-4 z-50">
            <div className="bg-white/80 backdrop-blur-md border border-brand-orange/20 rounded-full p-1 flex gap-1 shadow-lg">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === lang.code
                                ? "bg-brand-orange text-white shadow-md transform scale-105"
                                : "text-gray-600 hover:bg-brand-orange/10"
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
