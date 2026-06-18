import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { CalendarDays } from 'lucide-react';

import currentData from './data/current.json';
import forecastData from './data/forecast.json';
import hourlyProfileData from './data/hourly_profile.json';
import monthlyStatsData from './data/monthly_stats.json';
import observationsData from './data/observations.json';

import ChatbotWidget from './ChatbotWidget';

export default function App() {
    const current = Array.isArray(currentData) ? currentData[0] : currentData;
    const forecast = forecastData;
    const hourlyProfile = hourlyProfileData;
    const monthlyStats = monthlyStatsData;
    const observations = observationsData;

    const [selectedSeason, setSelectedSeason] = useState<string>('Été');
    const [searchDate, setSearchDate] = useState<string>("");

    const filteredHourly = hourlyProfile.filter((d: any) => d.saison === selectedSeason);

    const temp = current.temp_actuelle;
    const rh = current.humidity;
    const dewPoint = current.dew_point || 10;
    const e = (6.11 * Math.exp((5417.7530 * (1/273.16 - 1/(273.15 + dewPoint)))));
    const humidex = Math.round(temp + 5/9 * (e - 10));

    const todayForecast = forecast[0] || { tempMax: temp, tempMin: temp - 10 };
    const alerts = [];

    if (todayForecast.tempMax >= 29 && todayForecast.tempMin >= 20) {
        alerts.push({
            level: 'danger',
            msg: `🚨 ALERTE CANICULE : Max attendu de ${todayForecast.tempMax}°C et nuit tropicale à ${todayForecast.tempMin}°C ! Déclenchement du plan de sauvegarde.`
        });
    }
    else if (todayForecast.tempMax >= 30.1) {
        alerts.push({
            level: 'warning',
            msg: `FORTE CHALEUR : Pic prévu à ${todayForecast.tempMax}°C aujourd'hui. Hydratation recommandée.`
        });
    }

    if (humidex >= 40) alerts.push({ level: 'warning', msg: `Humidex très élevé (${humidex}). Danger en cas d'effort physique.` });
    if (current.wind_speed > 50) alerts.push({ level: 'warning', msg: `Vent fort : Rafales à ${current.wind_speed} km/h.` });

    const radarData = [
        { metric: 'Chaleur', value: Math.min(100, (temp / 40) * 100) },
        { metric: 'Humidité', value: rh || 0 },
        { metric: 'Vent', value: Math.min(100, ((current.wind_speed || 0) / 100) * 100) },
        { metric: 'Nuages', value: current.cloud_cover || 0 },
        { metric: 'Soleil', value: Math.min(100, ((current.radiation_max || 0) / 1000) * 100) }
    ];

    const searchResult = useMemo(() => {
        if (!searchDate) return null;
        const inForecast = forecast.find((d: any) => d.date === searchDate);
        if (inForecast) return { type: 'forecast', data: inForecast };

        const inPast = observations.filter((d: any) => d.date.startsWith(searchDate));
        if (inPast.length > 0) {
            const temps = inPast.map((d: any) => d.temperature_2m).filter((t: any) => t != null);
            const hums = inPast.map((d: any) => d.relative_humidity_2m).filter((h: any) => h != null);
            return {
                type: 'past',
                data: {
                    date: searchDate,
                    tempMax: Math.max(...temps),
                    tempMin: Math.min(...temps),
                    humMoy: Math.round(hums.reduce((a:any,b:any) => a+b, 0) / hums.length)
                }
            };
        }
        return { type: 'not_found', data: null };
    }, [searchDate, forecast, observations]);

    const getAlertUI = (max: number, min: number) => {
        if (max >= 29 && min >= 20) return { text: "CANICULE", style: "bg-red-900/50 border-red-500 text-red-400" };
        if (max >= 30.1) return { text: "FORTE CHALEUR", style: "bg-orange-900/50 border-orange-500 text-orange-400" };
        if (max < 5) return { text: "FROID", style: "bg-cyan-900/50 border-cyan-500 text-cyan-400" };
        return { text: "NORMAL", style: "bg-green-900/50 border-green-500 text-green-400" };
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">

            {/* HEADER */}
            <header className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        MétéoMetrics Paris  — Dashboard
                    </h1>
                </div>
            </header>

            {/* MOTEUR DE RECHERCHE */}
            <section className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-5 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <CalendarDays className="text-indigo-400 w-8 h-8" />
                        <div>
                            <h2 className="text-lg font-bold text-indigo-100">Vérifier une date</h2>
                            <p className="text-[10px] text-indigo-300">Historique ou Prévisions</p>
                        </div>
                    </div>

                    <input
                        type="date"
                        className="w-full md:w-48 px-4 py-2 bg-slate-800 border border-indigo-500/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />

                    {searchResult && searchResult.type === 'forecast' && (
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <div className="bg-indigo-900/50 p-2 rounded-xl border border-indigo-500/30 text-center">
                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Max</p>
                                <p className="text-lg font-black text-amber-400">{searchResult.data.tempMax}°C</p>
                            </div>
                            <div className="bg-indigo-900/50 p-2 rounded-xl border border-indigo-500/30 text-center">
                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Min</p>
                                <p className="text-lg font-black text-blue-400">{searchResult.data.tempMin}°C</p>
                            </div>
                            <div className="bg-indigo-900/50 p-2 rounded-xl border border-indigo-500/30 text-center">
                                <p className="text-[10px] text-indigo-300 uppercase font-bold">Normale</p>
                                <p className="text-lg font-black text-slate-300">{searchResult.data.normale}°C</p>
                            </div>
                            <div className={`p-2 rounded-xl border text-center flex items-center justify-center ${getAlertUI(searchResult.data.tempMax, searchResult.data.tempMin).style}`}>
                                <p className="font-black text-sm tracking-widest">{getAlertUI(searchResult.data.tempMax, searchResult.data.tempMin).text}</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ALERTES ACTUELLES */}
            {alerts.length > 0 && (
                <div className="mb-6 space-y-3">
                    {alerts.map((al, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 ${
                            al.level === 'danger' ? 'bg-red-950/60 border-red-600 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-orange-950/40 border-orange-600 text-orange-200'
                        }`}>
                            <span className="text-2xl animate-pulse">{al.level === 'danger' ? '🚨' : '⚠️'}</span>
                            <p className="text-sm font-semibold">{al.msg}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* KPIs EN DIRECT */}
            <section className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Température</p>
                        <p className="text-2xl font-black text-amber-400 mt-1">{temp ?? '--'}°C</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Indice Humidex</p>
                        <p className="text-2xl font-black text-purple-400 mt-1">{!isNaN(humidex) ? humidex : '--'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Humidité</p>
                        <p className="text-2xl font-black text-blue-400 mt-1">{rh ?? '--'}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Vent</p>
                        <p className="text-2xl font-black text-teal-400 mt-1">{current.wind_speed ?? '--'} <span className="text-xs font-normal">km/h</span></p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Nuages</p>
                        <p className="text-2xl font-black text-slate-300 mt-1">{current.cloud_cover ?? '--'}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-md">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Rayonnement</p>
                        <p className="text-2xl font-black text-yellow-500 mt-1">{current.radiation_max ?? '--'} <span className="text-xs font-normal">W/m²</span></p>
                    </div>
                </div>
            </section>

            {/* GRILLE DES GRAPHES */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* RADAR CHART (Empreinte Météo) */}
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center">
                    <div className="w-full mb-2">
                        <h3 className="text-md font-bold text-slate-100">🕸️ Empreinte Météo Actuelle</h3>
                        <p className="text-[10px] text-slate-400">Intensité des facteurs (0 à 100)</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Conditions" dataKey="value" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AREA CHART (Prévisions & Anomalie) */}
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 shadow-xl xl:col-span-2">
                    <div className="mb-4">
                        <h3 className="text-md font-bold text-slate-100">🔮 Prévisions à 15 jours (Anomalie Thermique)</h3>
                        <p className="text-[10px] text-slate-400">La zone rouge montre l'écart prévu au-dessus des normales de saison</p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast.slice(0, 15)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="°C" domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />

                                <Area type="monotone" dataKey="tempMax" stroke="#f43f5e" fillOpacity={1} fill="url(#colorMax)" name="Max Prévu" />
                                <Line type="monotone" dataKey="normale" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Normale Saison" />
                                <Line type="monotone" dataKey="tempMin" stroke="#3b82f6" strokeWidth={2} dot={false} name="Min Nuit" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CLIMATOLOGIE MENSUELLE */}
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 shadow-xl xl:col-span-3">
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="text-md font-bold text-slate-100">Climat Mensuelle & Cycle Journalier</h3>
                        </div>
                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                            {['Hiver', 'Printemps', 'Été', 'Automne'].map((season) => (
                                <button
                                    key={season}
                                    onClick={() => setSelectedSeason(season)}
                                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                                        selectedSeason === season ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {season}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="mois_label" stroke="#64748b" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748b" unit="°C" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Bar dataKey="record_chaud" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Record Chaleur" />
                                <Bar dataKey="temp_moy" fill="#fb923c" radius={[4, 4, 0, 0]} name="Moyenne" />
                                <Bar dataKey="record_froid" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Record Froid" />
                            </BarChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredHourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="heure" stroke="#64748b" unit="h" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Line type="monotone" dataKey="temp_moy" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Temp. (°C)" />
                                <Line type="monotone" dataKey="humidity_moy" stroke="#0ea5e9" strokeWidth={1.5} dot={false} name="Humidité (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* PLAN LOGISTIQUE */}
            <footer className="mt-8 bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-3">Recommandations & Plan Logistique Territorial</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        <span className="font-bold text-amber-400 block mb-1">☀️ Alerte Chaleur (Si &gt;30°C) :</span>
                        Déclenchement des points d'eau municipaux, patrouilles pour personnes vulnérables.
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        <span className="font-bold text-blue-400 block mb-1">🌧️ Gestion Hydrologique :</span>
                        Suivi des précipitations mensuelles pour planifier les opérations de nettoyage des réseaux de drainage.
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        <span className="font-bold text-teal-400 block mb-1">🍃 Espaces Verts & Arrosage :</span>
                        Croiser l'humidité (profil saisonnier) et les prévisions de pluie pour optimiser l'irrigation communale.
                    </div>
                </div>
            </footer>

            {/* === LE WIDGET CHATBOT IA === */}
            <ChatbotWidget />

        </div>
    );
}