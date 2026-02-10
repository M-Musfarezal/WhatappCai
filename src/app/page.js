'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [status, setStatus] = useState({ connected: false, qr: null, user: null });
  const [loading, setLoading] = useState(true);
  const [blastData, setBlastData] = useState({ numbers: '', message: '', delayMin: 10, delayMax: 30 });
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);

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

  const handleBlast = async (e) => {
    e.preventDefault();
    setSending(true);
    setLogs(prev => [...prev, 'Starting campaign...']);
    
    const numberList = blastData.numbers.split('\n').filter(n => n.trim() !== '');
    
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: numberList,
          message: blastData.message,
          delayMin: parseInt(blastData.delayMin),
          delayMax: parseInt(blastData.delayMax)
        })
      });
      
      const result = await res.json();
      if (result.success) {
        setLogs(prev => [...prev, `Campaign finished! Sent: ${result.results.length}`]);
      } else {
        setLogs(prev => [...prev, `Error: ${result.error}`]);
      }
    } catch (err) {
      setLogs(prev => [...prev, `Failed to send: ${err.message}`]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              CAI WHATSAPP ENGINE
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sistem Blast Murah & Padu BossMM</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-700">
            <div className={`w-3 h-3 rounded-full animate-pulse ${status.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="font-medium">{status.connected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Status & QR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">●</span> Device Connection
              </h2>
              
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : status.connected ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400">
                    <p className="text-xs uppercase tracking-wider font-bold mb-1">Akaun Aktif</p>
                    <p className="text-lg font-mono">{status.user?.id.split(':')[0]}</p>
                    <p className="text-sm opacity-80">{status.user?.name || 'WhatsApp User'}</p>
                  </div>
                  <button className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold transition border border-rose-500/20">
                    Logout Device
                  </button>
                </div>
              ) : status.qr ? (
                <div className="bg-white p-4 rounded-xl flex flex-col items-center shadow-inner">
                  <QRCodeSVG value={status.qr} size={200} />
                  <p className="text-gray-900 mt-4 text-xs font-bold text-center leading-tight">
                    BUKA WHATSAPP > SETTINGS > LINKED DEVICES
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-400 text-sm">Menjana QR Code...</p>
                </div>
              )}
            </div>

            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-emerald-400">●</span> Activity Logs
              </h2>
              <div className="bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <p className="text-gray-600">No recent activity...</p>
                ) : (
                  logs.map((log, i) => (
                    <p key={i} className={log.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}>
                      > {log}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Campaign Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-blue-400">●</span> Launch Campaign
              </h2>
              
              <form onSubmit={handleBlast} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    Target Numbers (Satu per baris)
                  </label>
                  <textarea 
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-32 font-mono text-sm"
                    placeholder="60123456789&#10;60198765432"
                    value={blastData.numbers}
                    onChange={(e) => setBlastData({...blastData, numbers: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    Mesej Blast
                  </label>
                  <textarea 
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-32 font-mono text-sm"
                    placeholder="Hi BossMM! Apa khabar?"
                    value={blastData.message}
                    onChange={(e) => setBlastData({...blastData, message: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">
                      Min Delay (Sec)
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                      value={blastData.delayMin}
                      onChange={(e) => setBlastData({...blastData, delayMin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">
                      Max Delay (Sec)
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                      value={blastData.delayMax}
                      onChange={(e) => setBlastData({...blastData, delayMax: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!status.connected || sending}
                  className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg ${
                    !status.connected || sending 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transform hover:-translate-y-1'
                  }`}
                >
                  {sending ? 'SEDANG MENGHANTAR...' : 'LANCARKAN CAMPAIGN'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
