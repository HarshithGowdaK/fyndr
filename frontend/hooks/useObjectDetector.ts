"use client";

import { useEffect, useState, useRef } from "react";
import { ObjectDetector, FilesetResolver, Detection } from "@mediapipe/tasks-vision";

export const useObjectDetector = () => {
    const [detector, setDetector] = useState<ObjectDetector | null>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
                );
                const objectDetector = await ObjectDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
                        delegate: "CPU",
                    },
                    scoreThreshold: 0.5,
                    runningMode: "IMAGE",
                });
                setDetector(objectDetector);
                setLoading(false);
                console.log("MediaPipe Object Detector Loaded");
            } catch (error) {
                console.error("Error initializing MediaPipe:", error);
                setError(error instanceof Error ? error.message : "Failed to load AI model");
                setLoading(false);
            }
        };

        initializeDetector();
    }, []);

    const detectObjects = async (imageElement: HTMLImageElement): Promise<Detection[]> => {
        if (!detector) return [];
        return detector.detect(imageElement).detections;
    };

    return { detector, loading, error, detectObjects };
};
