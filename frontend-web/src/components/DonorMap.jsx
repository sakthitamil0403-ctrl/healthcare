import React from 'react';
import { MapPin } from 'lucide-react';

export default function DonorMap({ donors }) {
    return (
        <div className="relative w-full h-[500px] bg-slate-200 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                [ Google Maps Integration Placeholder ]
            </div>
            {/* Mock Markers */}
            {donors.map((donor, i) => (
                <div 
                    key={donor._id || i}
                    className="absolute group cursor-pointer transition-transform hover:scale-110"
                    style={{ 
                        left: `${40 + (i * 10)}%`, 
                        top: `${30 + (i * 15)}%` 
                    }}
                >
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                        <MapPin size={24} />
                    </div>
                    <div className="hidden group-hover:block absolute top-full mt-2 bg-white p-2 rounded shadow-md z-20 w-32">
                        <p className="text-xs font-bold">{donor.user?.name || 'Donor'}</p>
                        <p className="text-[10px] text-gray-500">{donor.bloodType}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
