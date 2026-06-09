import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';

const WeeklyReportCard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get('/reports/latest');
        if (data && !data.message) setReport(data);
      } catch (error) {
        console.error("Report fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div className="glass-bg p-6 rounded-3xl h-64 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>;

  if (!report) return null; // Agar report nahi hai toh mat dikhao

  return (
    <div className="glass-bg p-6 rounded-3xl border border-purple-500/30 bg-purple-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl -mr-10 -mt-10"></div>
      
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-400 fill-yellow-400" /> Weekly AI Wellness Insight
      </h3>
      
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="font-semibold text-purple-200 mb-1">💡 Analysis</p>
          <p>{report.summary}</p>
        </div>
        
        {report.suggestions && (
            <div>
                 <p className="font-semibold text-blue-200 mb-2">🎯 Recommended Actions</p>
                 <ul className="list-disc list-inside space-y-1 text-gray-400">
                    {report.suggestions.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportCard;