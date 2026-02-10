'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [status, setStatus] = useState({ connected: false, qr: null, user: null });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">WhatsApp Marketing Dashboard</h1>
        
        {loading ? (
          <p>Loading status...</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-xl">
                Status: {status.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>

            {status.connected && status.user ? (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="font-semibold">Logged in as:</p>
                <p className="text-gray-300">{status.user.id.split(':')[0]}</p>
                <p className="text-gray-300">{status.user.name}</p>
              </div>
            ) : status.qr ? (
              <div className="bg-white p-6 rounded-xl flex flex-col items-center">
                <p className="text-gray-900 mb-4 font-bold">Scan this QR Code</p>
                <QRCodeSVG value={status.qr} size={256} />
                <p className="text-gray-500 mt-4 text-sm text-center">Open WhatsApp on your phone &gt; Settings &gt; Linked Devices</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Waiting for QR Code generation...</p>
            )}

            <div className="mt-8 pt-8 border-t border-gray-700">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
                  Create Campaign
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition">
                  Manage Leads
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
