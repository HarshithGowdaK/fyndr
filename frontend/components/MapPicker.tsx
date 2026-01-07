"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useState, useEffect } from "react";

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

    return position === null ? null : <Marker position={position}></Marker>;
};

const MapPicker = ({ onLocationSelect }: MapPickerProps) => {
    return (
        <div className="h-full w-full rounded-lg overflow-hidden relative z-0 isolation-auto">
            <MapContainer
                center={[51.505, -0.09]} // Default (London) until geo kicks in
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
