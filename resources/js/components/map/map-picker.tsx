"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"

const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

export function MapPicker({ lat, lng, onChange }: any) {
    const nLat = Number(lat);
    const nLng = Number(lng);

    function LocationMarker() {
        useMapEvents({
            click(e) {
                handleLocationChange(e.latlng.lat, e.latlng.lng)
            },
        })
        return <Marker position={[nLat, nLng]} icon={icon} />
    }

    const handleLocationChange = async (newLat: number, newLng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newLat}&lon=${newLng}`
            )
            const data = await response.json()
            onChange({ lat: newLat, lng: newLng, address: data.display_name })
        } catch (error) {
            onChange({ lat: newLat, lng: newLng })
        }
    }

    return (
        <div className="relative w-full h-[150px] rounded-xl overflow-hidden border border-border group z-0">
            <MapContainer
                center={[nLat, nLng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
                <ChangeMapView lat={nLat} lng={nLng} />
            </MapContainer>
            <div className="absolute top-2 right-2 z-[1000]">
                <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border text-[10px] font-mono font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    {nLat.toFixed(6)}, {nLng.toFixed(6)}
                </div>
            </div>
        </div>
    )
}