import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = ['#34d399', '#60a5fa', '#facc15', '#f87171', '#a78bfa'];

const ActivityChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    // Container: 'h-full' hata diya taaki zabardasti stretch na ho
    <div className="glass-card p-6 rounded-3xl border border-white/10 w-full">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Activity size={20} className="text-purple-400" /> Activity Distribution
      </h3>
      
      {/* Fixed Height Container for Pie Chart */}
      <div className="h-[300px] w-full flex items-center justify-center">
        {safeData && safeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeData}
                cx="50%"
                cy="50%"
                innerRadius={60}  // Donut style (beech mein khali)
                outerRadius={80}  // Ring ki motai
                paddingAngle={5}
                dataKey="value"
                stroke="none"     // Border hata diya cleaner look ke liye
              >
                {safeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                 itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          // Empty State (Agar koi data nahi hai)
          <div className="text-center space-y-2 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                <Activity className="text-gray-600 w-8 h-8" />
            </div>
            <p className="text-gray-400 font-medium">No activity data yet.</p>
            <p className="text-xs text-gray-500">Use the mobile app to track activity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityChart;