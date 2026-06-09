import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MoodChart = ({ data, palette }) => {
  return (
    // FIX: 'min-w-0' flex items ko shrink hone deta hai, overflow rokta hai
    <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col min-w-0 w-full relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400"/> Mood Flow
            </h3>
        </div>
        
        {/* FIX: Fixed height + min-w-0 for Recharts */}
        <div className="h-[200px] md:h-[250px] w-full min-w-0 relative">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={palette.primary} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={palette.primary} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="day" 
                            stroke="#6b7280" 
                            tick={{fontSize: 12}} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={10} 
                        />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'transparent', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '10px', color: '#fff' }}
                            itemStyle={{ color: palette.primary }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                            formatter={(value, name, props) => [props.payload.mood, 'Mood']}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke={palette.primary} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <TrendingUp className="opacity-20" size={40} />
                    <span className="text-sm">No mood logs yet</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default MoodChart;