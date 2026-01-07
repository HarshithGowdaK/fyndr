"use client";

import React, { useState, useRef } from "react";
import { useObjectDetector } from "@/hooks/useObjectDetector";

interface ImageUploaderProps {
    onFileSelect?: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect }) => {
    const { detectObjects, loading, error } = useObjectDetector();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [detections, setDetections] = useState<string[]>([]);
    const [verifying, setVerifying] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (onFileSelect) {
                onFileSelect(file);
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
                setDetections([]); // Reset detections
            };
            reader.readAsDataURL(file);
        }
    };

    const verifyImage = async () => {
        if (!imageRef.current) return;
        setVerifying(true);
        const results = await detectObjects(imageRef.current);
        const detectedClasses = results.map((d) => d.categories[0].categoryName);
        setDetections(detectedClasses);
        setVerifying(false);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg border border-gray-200 shadow-sm mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                Ai Visual Check
                {loading && <span className="text-xs font-normal text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Loading Model...</span>}
                {!loading && !error && <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded">Model Ready</span>}
                {error && <span className="text-xs font-normal text-red-600 bg-red-100 px-2 py-1 rounded">Error: {error}</span>}
            </h3>

            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
            />

            {imageSrc && (
                <div className="relative mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="Upload Preview"
                        className="w-full h-auto rounded-lg border border-gray-300"
                    />

                    {!verifying && detections.length === 0 && !loading && (
                        <button
                            onClick={verifyImage}
                            className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            Check with AI
                        </button>
                    )}
                </div>
            )}

            {verifying && <p className="text-blue-600 animate-pulse text-center">Analyzing image...</p>}

            {detections.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Detected Objects:</p>
                    <div className="flex flex-wrap gap-2">
                        {detections.map((det, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded border border-indigo-400">
                                {det}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
