
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MapWrapper from '@/components/MapWrapper';
import ImageUploader from '@/components/ImageUploader';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

interface SearchResult {
    item_id?: string;
    metadata: {
        description: string;
        lat: number;
        lng: number;
        filename: string;
        image_url?: string;
        contact_info?: string;
        reporter_uid?: string;
    };
    similarity_score: number;
    hybrid_score: number;
    distance_km: number;
}

export default function SearchPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    const handleSearch = async () => {
        if (!file || !location) {
            alert("Please upload a reference image and select a location to search around.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        if (description) formData.append("description", description);
        formData.append("lat", location.lat.toString());
        formData.append("lng", location.lng.toString());

        try {
            const res = await fetch("http://localhost:8000/items/search", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data: SearchResult[] = await res.json();
                // Filter: Must have image key and it shouldn't be empty
                // Slice: Top 3 only
                const filteredData = data
                    .filter(item => item.metadata.image_url)
                    .slice(0, 3);
                setResults(filteredData);
            } else {
                alert("Search failed.");
                console.error(await res.text());
            }
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    // Swipe Logic
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastDirection, setLastDirection] = useState<string | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const handleSwipe = async (direction: string, item: SearchResult) => {
        setLastDirection(direction);

        // Log Feedback
        try {
            await fetch("http://localhost:8000/items/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item_id: item.item_id || "unknown", // Assuming item_id exists in response now or use hash
                    feedback: direction === "right" ? "positive" : "negative"
                })
            });
        } catch (e) {
            console.error("Feedback error", e);
        }

        if (direction === "right") {
            setShowContactModal(true);
            // Don't advance index immediately, wait for modal close? 
            // Actually, usually you match and see details. 
            // Let's show modal.
        } else {
            // Next card
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setLastDirection(null);
            }, 300);
        }
    };

    const handleModalClose = () => {
        setShowContactModal(false);
        setCurrentIndex((prev) => prev + 1);
        setLastDirection(null);
    };

    return (
        <main className="min-h-screen p-8 bg-brand-cream flex flex-col items-center relative overflow-hidden">
            <LanguageSwitcher />
            <div className="max-w-xl w-full flex flex-col h-full pointer-events-none z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pt-8 pointer-events-auto">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black font-medium transition-colors">
                        &larr; {t('search.back')}
                    </button>
                    <h1 className="text-3xl font-bold text-black">{t('search.title')}</h1>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
                    </div>
                )}

                {/* Input Form (Hidden if results exist? Or just collapsed? Let's hide it for focus) */}
                {results.length === 0 && !loading && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 pointer-events-auto">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-lg font-bold text-black mb-3">{t('search.step1')}</label>
                                <ImageUploader onFileSelect={setFile} />
                            </div>

                            <div>
                                <label className="block text-lg font-bold text-black mb-3">{t('search.step3') || "3. Description (Optional)"}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('search.descPlaceholder')}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-orange focus:ring-0 text-black text-lg min-h-[100px]"
                                />
                            </div>
                            <div className="h-[200px] border-2 border-dashed border-gray-200 rounded-2xl p-2 bg-gray-50">
                                <MapWrapper onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-black text-white font-bold text-xl shadow-lg hover:bg-gray-900"
                            >
                                {t('search.button')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Swipe Stack */}
                {results.length > 0 && currentIndex < results.length && (
                    <div className="flex-1 flex flex-col items-center justify-center relative pointer-events-auto min-h-[500px]">
                        <h2 className="text-2xl font-bold mb-4 text-black text-center">{t('swipe.recognize')}</h2>

                        <div className="relative w-full max-w-sm h-[600px]">
                            {results.map((item, index) => {
                                // Only render top 2 cards for performance
                                if (index < currentIndex) return null;
                                if (index > currentIndex + 1) return null;

                                return (
                                    <SwipeCard
                                        key={index}
                                        item={item}
                                        isFront={index === currentIndex}
                                        onSwipe={(dir) => handleSwipe(dir, item)}
                                        t={t}
                                    />
                                );
                            })}
                        </div>

                        <div className="text-center mt-6 text-gray-500 text-sm">
                            {t('swipe.instruction')}
                        </div>
                    </div>
                )}

                {results.length > 0 && currentIndex >= results.length && (
                    <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
                        <div className="text-2xl font-bold text-gray-400 mb-4">{t('swipe.noMore')}</div>
                        <button onClick={() => { setResults([]); setCurrentIndex(0); }} className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold">
                            {t('swipe.searchAgain')}
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Modal for Contact Info */}
            {showContactModal && results[currentIndex] && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                📞
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-2">{t('swipe.matchModalTitle')}</h3>
                            <p className="text-gray-600 mb-6">{t('swipe.matchModalDesc')}</p>

                            <div className="bg-gray-50 p-4 rounded-xl mb-6 font-mono text-lg text-center font-bold border border-gray-200">
                                {results[currentIndex].metadata.contact_info || t('search.noContact')}
                            </div>

                            <div className="flex flex-col gap-3">
                                {results[currentIndex].metadata.contact_info && (
                                    <a href={`tel:${results[currentIndex].metadata.contact_info} `} className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-center hover:bg-orange-600">
                                        {t('swipe.callNow')}
                                    </a>
                                )}
                                <button onClick={handleModalClose} className="text-gray-500 font-medium py-2 hover:text-black">
                                    {t('swipe.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

function SwipeCard({ item, isFront, onSwipe, t }: { item: SearchResult, isFront: boolean, onSwipe: (dir: string) => void, t: any }) {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const overlayRightOpacity = useTransform(x, [0, 150], [0, 1]); // Green overlay for right
    const overlayLeftOpacity = useTransform(x, [0, -150], [0, 1]); // Red overlay for left

    const handleDragEnd = async (_: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            await controls.start({ x: 500, opacity: 0 });
            onSwipe("right");
        } else if (offset < -100 || velocity < -500) {
            await controls.start({ x: -500, opacity: 0 });
            onSwipe("left");
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity: isFront ? 1 : 0.5,
                scale: isFront ? 1 : 0.95,
                zIndex: isFront ? 10 : 0
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
        >
            {/* Overlays for visual feedback */}
            <motion.div style={{ opacity: overlayRightOpacity }} className="absolute inset-0 bg-green-500/20 z-20 pointer-events-none flex items-center justify-center">
                <div className="border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl -rotate-12 bg-white/50">{t('swipe.match')}</div>
            </motion.div>
            <motion.div style={{ opacity: overlayLeftOpacity }} className="absolute inset-0 bg-red-500/20 z-20 pointer-events-none flex items-center justify-center">
                <div className="border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-12 bg-white/50">{t('swipe.nope')}</div>
            </motion.div>

            {/* Image */}
            <div className="h-2/3 w-full bg-gray-100 relative">
                {item.metadata.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={item.metadata.image_url}
                        alt="Item"
                        className="w-full h-full object-cover pointer-events-none select-none"
                    />
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                    <h3 className="text-white font-bold text-3xl">{item.metadata.description}</h3>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                        📍 {item.distance_km.toFixed(1)} km {t('search.away')}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="h-1/3 p-6 flex flex-col justify-between bg-white">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 font-medium">{t('swipe.confidence')}</span>
                        <span className="text-brand-orange font-bold text-lg">{(item.hybrid_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-brand-orange h-full rounded-full" style={{ width: `${item.hybrid_score * 100}% ` }}></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 text-center">{t('swipe.swipeHint')}</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { controls.start({ x: -500 }); onSwipe("left"); }} className="flex-1 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-colors uppercase">{t('swipe.nope')}</button>
                    <button onClick={() => { controls.start({ x: 500 }); onSwipe("right"); }} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors uppercase">{t('swipe.match')}</button>
                </div>
            </div>
        </motion.div>
    );
}
