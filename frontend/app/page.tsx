"use client";

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-brand-cream relative overflow-hidden">
            <LanguageSwitcher />

            {/* Abstract Background Decoration (Optional) */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 text-center max-w-2xl w-full">
                <h1 className="text-6xl font-bold text-black mb-4 tracking-tight">
                    {t('hero.title')}
                </h1>
                <p className="text-xl text-gray-700 mb-12 font-medium">
                    {t('hero.subtitle')} <br />
                    <span className="text-brand-orange">{t('hero.tagline')}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
                    {/* Finder Card */}
                    <Link href="/report" className="group">
                        <div className="bg-white hover:bg-white/80 transition-all duration-300 p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-brand-orange flex flex-col items-center h-full">
                            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-black mb-2">{t('card.found.title')}</h2>
                            <p className="text-gray-500 text-sm">{t('card.found.desc')}</p>
                        </div>
                    </Link>

                    {/* Seeker Card */}
                    <Link href="/search" className="group">
                        <div className="bg-brand-orange hover:bg-brand-orange/90 transition-all duration-300 p-8 rounded-3xl shadow-lg shadow-brand-orange/30 border-2 border-transparent flex flex-col items-center h-full">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{t('card.lost.title')}</h2>
                            <p className="text-white/80 text-sm">{t('card.lost.desc')}</p>
                        </div>
                    </Link>
                </div>

                <div className="mt-16 text-sm text-gray-400">
                    {t('footer.text')}
                </div>
            </div>
        </main>
    );
}
