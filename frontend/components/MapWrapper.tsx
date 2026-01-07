"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapPickerClient = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>,
});

interface MapWrapperProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
    return <MapPickerClient {...props} />;
};

export default MapWrapper;
