
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Card from './components/Card';
import { 
  PhysicalHealthData, 
  MentalWellnessData, 
  HealthAnalysisResponse, 
  ChatMessage,
  TrendData,
  RiskLevel
} from './types';
import { analyzeHealthData, getChatResponse } from './services/geminiService';
import { 
  ResponsiveContainer, 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [physicalData, setPhysicalData] = useState<PhysicalHealthData>({
    name: '',
    age: 30,
    bmi: 24,
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 72,
    smoking: 'never',
    exerciseFreq: 'weekly',
    medicalHistory: '',
    selectedDisease: 'None',
    specificValue: ''
  });

  const [mentalData, setMentalData] = useState<MentalWellnessData>({
    sleepHours: 7,
    screenTime: 6,
    mood: 'okay',
    activityLevel: 'moderate'
  });

  const [analysis, setAnalysis] = useState<HealthAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Hello! I am your AI Wellness Coach. Complete the vitals on the left to begin your journey.' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Persistence: Load previous record on startup
  useEffect(() => {
    const saved = localStorage.getItem('healthsense_record');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPhysicalData(parsed.physical || physicalData);
        setMentalData(parsed.mental || mentalData);
        setAnalysis(parsed.analysis || null);
        if (parsed.analysis) {
           setMessages(prev => [...prev, { role: 'model', text: `Welcome back, ${parsed.physical.name}. Your last stability score was ${parsed.analysis.stabilityScore}. How can I assist you today?` }]);
        }
      } catch (e) {
        console.error("Failed to load saved record", e);
      }
    }
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    localStorage.setItem('healthsense_record', JSON.stringify({
      physical: physicalData,
      mental: mentalData,
      analysis: analysis
    }));
  }, [physicalData, mentalData, analysis]);

  const trendData: TrendData[] = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const stressBase = analysis?.mentalWellness.stressScore || 45;
    const physBase = analysis?.physicalRisk.score || 25;
    return days.map((d) => ({
      day: d,
      stress: Math.max(5, Math.min(95, stressBase + (Math.random() * 15 - 7))),
      physical: Math.max(5, Math.min(95, physBase + (Math.random() * 10 - 5)))
    }));
  }, [analysis]);

  const handleRunAnalysis = async () => {
    if (!physicalData.name.trim()) {
      setError("Please enter a patient name to proceed.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeHealthData(physicalData, mentalData);
      setAnalysis(result);
      setCurrentView('dashboard');
    } catch (err: any) {
      setError("Medical processing error. Please verify your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const resp = await getChatResponse([], msg);
      setMessages(prev => [...prev, { role: 'model', text: resp }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the medical core." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const generatePDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 25;

    // Header
    doc.setFontSize(26);
    doc.setTextColor(37, 99, 235);
    doc.text('HealthSense AI', margin, y);
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text('Advanced Stability & Risk Report', margin, y + 7);
    y += 25;

    // Section 1: Patient Information
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Patient Identity & Vitals', margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Patient Name: ${physicalData.name}`, margin, y);
    doc.text(`Age: ${physicalData.age}`, margin + 60, y);
    doc.text(`BMI: ${physicalData.bmi}`, margin + 120, y);
    y += 7;
    doc.text(`Blood Pressure: ${physicalData.systolicBP}/${physicalData.diastolicBP} mmHg`, margin, y);
    doc.text(`Heart Rate: ${physicalData.heartRate} BPM`, margin + 60, y);
    doc.text(`Report ID: HS-${Date.now().toString().slice(-6)}`, margin + 120, y);
    y += 15;

    // Section 2: Lifestyle & Mental Base
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Lifestyle & Mental Baseline', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Smoking Status: ${physicalData.smoking}`, margin, y);
    doc.text(`Exercise Frequency: ${physicalData.exerciseFreq}`, margin + 70, y);
    y += 7;
    doc.text(`Mental State (Self): ${mentalData.mood}`, margin, y);
    doc.text(`Daily Activity Level: ${mentalData.activityLevel}`, margin + 70, y);
    y += 7;
    doc.text(`Avg Sleep: ${mentalData.sleepHours} Hours`, margin, y);
    doc.text(`Avg Screen Time: ${mentalData.screenTime} Hours`, margin + 70, y);
    y += 15;

    // Section 3: Stability Analysis
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('3. AI Stability Index', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`Stability Score: ${analysis.stabilityScore}%`, margin, y);
    doc.setFontSize(12);
    doc.setTextColor(analysis.stabilityScore > 70 ? 22 : 185, analysis.stabilityScore > 70 ? 163 : 28, analysis.stabilityScore > 70 ? 74 : 28);
    doc.text(`Status: ${analysis.stabilityZone}`, margin + 70, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'italic');
    const splitExplanation = doc.splitTextToSize(`Clinical Rationale: ${analysis.explanation}`, 170);
    doc.text(splitExplanation, margin, y);
    y += splitExplanation.length * 5 + 10;

    // Section 4: Physical & Mental Risks
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Detailed Risk Profiling', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Physical Risk Level: ${analysis.physicalRisk.level}`, margin, y);
    doc.text(`Stress/Burnout Score: ${analysis.mentalWellness.stressScore}%`, margin + 70, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Identified Factors:', margin, y);
    y += 5;
    analysis.physicalRisk.factors.forEach((f) => {
      doc.text(`- ${f}`, margin + 5, y);
      y += 5;
    });
    
    y += 5;
    doc.text('Mental Insights:', margin, y);
    y += 5;
    analysis.mentalWellness.insights.forEach((i) => {
      doc.text(`- ${i}`, margin + 5, y);
      y += 5;
    });
    y += 10;

    // Section 5: Clinical Advice & Medicines
    if (y > 230) { doc.addPage(); y = 25; }
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Clinical Recommendations', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Consultation Urgency: ${analysis.clinicalAdvice.urgency}`, margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const doctorReason = doc.splitTextToSize(`Medical Reason: ${analysis.clinicalAdvice.doctorReason}`, 170);
    doc.text(doctorReason, margin, y);
    y += doctorReason.length * 5 + 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Predicted Support (Medicines/Supplements):', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    analysis.clinicalAdvice.generalMedicines.forEach((m) => {
      doc.text(`- ${m}`, margin + 5, y);
      y += 5;
    });
    y += 10;

    // Section 6: Wellness Roadmap
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Preventive Wellness Roadmap', margin, y);
    doc.line(margin, y + 2, 190, y + 2);
    y += 12;

    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(`Master Health Hack: ${analysis.wellnessPlan.uniqueHealthHack}`, margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Suggested Daily Routine:', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    analysis.wellnessPlan.routinePlan.forEach((p, idx) => {
      doc.text(`${idx + 1}. ${p}`, margin + 5, y);
      y += 6;
    });

    doc.save(`HealthSense_Full_Clinical_Report_${physicalData.name}.pdf`);
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 flex flex-col items-center justify-center relative">
          <div className={`absolute top-0 inset-x-0 h-2.5 rounded-t-full ${analysis!.stabilityScore > 75 ? 'bg-green-500' : analysis!.stabilityScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 text-center">Master Stability Index</h4>
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-100" />
              <circle 
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="14" fill="transparent" 
                strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * analysis!.stabilityScore) / 100}
                className={`${analysis!.stabilityScore > 75 ? 'text-green-500' : analysis!.stabilityScore > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-[1s]`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-slate-800">{analysis!.stabilityScore}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase mt-2">Points</span>
            </div>
          </div>
          <div className={`mt-10 px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest ${analysis!.stabilityScore > 75 ? 'bg-green-100 text-green-700' : analysis!.stabilityScore > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {analysis!.stabilityZone} Status
          </div>
        </div>
        <div className="md:col-span-7 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10">
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Clinical Input Overview</h4>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
               <div>
                  <span className="text-[10px] text-blue-400 uppercase block font-black mb-1">Smoking</span>
                  <span className="text-sm font-bold capitalize text-blue-800">{physicalData.smoking}</span>
               </div>
               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-black text-[10px]">M1</div>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
               <div>
                  <span className="text-[10px] text-indigo-400 uppercase block font-black mb-1">Exercise</span>
                  <span className="text-sm font-bold capitalize text-indigo-800">{physicalData.exerciseFreq}</span>
               </div>
               <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-black text-[10px]">M1</div>
            </div>
            <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 flex items-center justify-between">
               <div>
                  <span className="text-[10px] text-violet-400 uppercase block font-black mb-1">Self Mood</span>
                  <span className="text-sm font-bold capitalize text-violet-800">{mentalData.mood}</span>
               </div>
               <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-500 font-black text-[10px]">M2</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
               <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-black mb-1">Activity</span>
                  <span className="text-sm font-bold capitalize text-slate-800">{mentalData.activityLevel}</span>
               </div>
               <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black text-[10px]">M2</div>
            </div>
          </div>
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Health Stability Forecast</h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="stress" stroke="#3b82f6" strokeWidth={5} dot={false} />
                <Line type="monotone" dataKey="physical" stroke="#f59e0b" strokeWidth={5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-blue-400 mb-6 flex items-center gap-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Master AI Logic
          </h3>
          <p className="text-slate-300 text-lg leading-relaxed italic">"{analysis!.explanation}"</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase block mb-1">Clinical Context</span>
              <span className="text-sm font-bold">{physicalData.selectedDisease} Status</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase block mb-1">Vitals Precision</span>
              <span className="text-sm font-bold">{physicalData.systolicBP}/{physicalData.diastolicBP} BP • {physicalData.heartRate} HR</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase block mb-1">Stress Density</span>
              <span className="text-sm font-bold">{analysis!.mentalWellness.stressScore}% Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Physical Risk Profile" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Base Risk Score</span>
              <span className="text-3xl font-black text-slate-800">{analysis!.physicalRisk.score}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Smoking Status</span>
                <span className="text-sm font-bold text-slate-700 capitalize">{physicalData.smoking}</span>
              </div>
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">Exercise Rate</span>
                <span className="text-sm font-bold text-slate-700 capitalize">{physicalData.exerciseFreq}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Risk Factors</h5>
              <div className="flex flex-wrap gap-2">
                {analysis!.physicalRisk.factors.map((f, i) => (
                  <span key={i} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{f}</span>
                ))}
              </div>
            </div>
            <div className="p-6 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Disease Vulnerability</span>
                <p className="text-xl font-black mt-1">+{analysis!.diseaseAdjustment}% Adjusted Risk</p>
                <p className="text-[10px] mt-2 opacity-70">Based on reported {physicalData.selectedDisease}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card title="Clinical Intervention" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l2.368 2.368a2 2 0 002.828 0l2.368-2.368a2 2 0 00.547-1.022l-.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-1.022.547l-2.368 2.368a2 2 0 000 2.828l2.368 2.368a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-2.368-2.368z" /></svg>}>
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border-2 transition-all ${analysis!.clinicalAdvice.seeDoctor ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
               <h4 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${analysis!.clinicalAdvice.seeDoctor ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                 Consultation: {analysis!.clinicalAdvice.urgency}
               </h4>
               <p className="text-sm text-slate-600 leading-relaxed font-medium">{analysis!.clinicalAdvice.doctorReason}</p>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Medicines (AI Predicted)</h5>
              <div className="space-y-3">
                {analysis!.clinicalAdvice.generalMedicines.map((m, i) => (
                  <div key={i} className="px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-700 flex items-center gap-4 shadow-sm group hover:border-blue-200 transition-all">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all text-xs font-bold shrink-0">MED</div>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderMentalWellness = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 flex flex-col items-center justify-center">
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Stress Potential</h4>
          <div className="relative mb-6">
            <div className="text-8xl font-black text-slate-800 leading-none">{analysis!.mentalWellness.stressScore}</div>
            <div className="absolute -top-4 -right-8 text-blue-500 font-black text-2xl">%</div>
          </div>
          <div className="w-full space-y-3 mt-4">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase">Input Mood</span>
               <span className="text-sm font-bold text-slate-800 capitalize">{mentalData.mood}</span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase">Input Activity</span>
               <span className="text-sm font-bold text-slate-800 capitalize">{mentalData.activityLevel}</span>
            </div>
          </div>
          {analysis!.mentalWellness.burnoutWarning && (
            <div className="mt-8 p-6 bg-red-600 text-white rounded-3xl w-full flex flex-col items-center gap-2 animate-pulse shadow-xl shadow-red-200">
               <span className="font-black text-sm uppercase tracking-[0.2em]">Burnout Risk High</span>
            </div>
          )}
        </div>
        <div className="md:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10">
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Behavioral Clinical Insights</h4>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
                 {name: 'Sleep', val: Math.min(100, mentalData.sleepHours * 12)},
                 {name: 'Screen', val: Math.max(0, (24 - mentalData.screenTime) * 4)},
                 {name: 'Mood', val: mentalData.mood === 'great' ? 100 : mentalData.mood === 'okay' ? 70 : 40},
                 {name: 'Activity', val: mentalData.activityLevel === 'high' ? 100 : mentalData.activityLevel === 'moderate' ? 65 : 30}
               ]}>
                 <XAxis dataKey="name" hide />
                 <YAxis hide domain={[0, 100]} />
                 <Tooltip />
                 <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={5} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             {analysis!.mentalWellness.insights.map((ins, i) => (
               <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-xs font-bold text-slate-600 italic leading-relaxed">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mb-2"></div>
                 "{ins}"
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="lg:col-span-7 space-y-8">
        <Card title="Preventive Wellness Roadmap" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>
          <div className="space-y-8">
             <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative">
                <h5 className="text-[11px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4">Unique Stability Breakthrough</h5>
                <p className="text-3xl font-black italic">"{analysis!.wellnessPlan.uniqueHealthHack}"</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h6 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-6 border-b border-blue-50 pb-2">Stress Management</h6>
                  <ul className="space-y-4">
                    {analysis!.wellnessPlan.relaxationExercises.map((ex, i) => (
                      <li key={i} className="flex gap-4 text-sm font-bold text-slate-700 items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600 text-[10px] font-black">EX</div>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h6 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-6 border-b border-indigo-50 pb-2">Optimal Rest Tips</h6>
                  <ul className="space-y-4">
                    {analysis!.wellnessPlan.sleepTips.map((tip, i) => (
                      <li key={i} className="flex gap-4 text-sm font-bold text-slate-700 items-start">
                        <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 text-indigo-600 text-[10px] font-black">ZZ</div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
             <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl">
                <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-8 text-center">Standard Daily Routine</h6>
                <div className="space-y-4">
                  {analysis!.wellnessPlan.routinePlan.map((step, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all">
                      <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center font-black text-blue-400 shrink-0 text-xl">{i+1}</div>
                      <p className="text-base font-bold text-white/90">{step}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5">
        <div className="bg-white rounded-[2.5rem] flex flex-col h-[700px] shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8 bg-slate-50 flex items-center justify-between border-b border-slate-200">
            <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Wellness AI Concierge</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-7 py-5 rounded-[2rem] text-sm leading-relaxed shadow-sm font-medium ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4">
            <input 
              type="text" 
              value={inputMessage} 
              onChange={e => setInputMessage(e.target.value)}
              placeholder="How can I improve my BMI?" 
              className="flex-1 bg-slate-100 border-none rounded-[1.5rem] px-8 py-5 text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button type="submit" className="bg-blue-600 w-16 h-16 rounded-[1.5rem] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-100 transition-all active:scale-95">GO</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">
        
        {/* INPUT MODULES (PERSISTENT ON LEFT) */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Module 1: Physical Health Risk">
            <div className="space-y-4">
              <input type="text" placeholder="Patient Full Name" value={physicalData.name} onChange={e => setPhysicalData({...physicalData, name: e.target.value})} className="w-full px-4 py-4 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input type="number" value={physicalData.age} onChange={e => setPhysicalData({...physicalData, age: +e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">BMI</label>
                  <input type="number" value={physicalData.bmi} onChange={e => setPhysicalData({...physicalData, bmi: +e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">BP (Sys/Dia)</label>
                   <div className="flex items-center gap-2">
                     <input type="number" value={physicalData.systolicBP} onChange={e => setPhysicalData({...physicalData, systolicBP: +e.target.value})} className="w-full px-2 py-3 border rounded-lg text-center font-bold" />
                     <input type="number" value={physicalData.diastolicBP} onChange={e => setPhysicalData({...physicalData, diastolicBP: +e.target.value})} className="w-full px-2 py-3 border rounded-lg text-center font-bold" />
                   </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HR (BPM)</label>
                    <input type="number" value={physicalData.heartRate} onChange={e => setPhysicalData({...physicalData, heartRate: +e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Smoking</label>
                  <select value={physicalData.smoking} onChange={e => setPhysicalData({...physicalData, smoking: e.target.value as any})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold bg-white">
                    <option value="never">Never</option>
                    <option value="former">Former</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Exercise</label>
                  <select value={physicalData.exerciseFreq} onChange={e => setPhysicalData({...physicalData, exerciseFreq: e.target.value as any})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold bg-white">
                    <option value="rarely">Rarely</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Module 2: Mental Wellness Detection">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sleep Hrs</label>
                  <input type="number" value={mentalData.sleepHours} onChange={e => setMentalData({...mentalData, sleepHours: +e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Screen Hrs</label>
                  <input type="number" value={mentalData.screenTime} onChange={e => setMentalData({...mentalData, screenTime: +e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mood</label>
                  <select value={mentalData.mood} onChange={e => setMentalData({...mentalData, mood: e.target.value as any})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold bg-white">
                    <option value="great">Great</option>
                    <option value="okay">Okay</option>
                    <option value="stressed">Stressed</option>
                    <option value="down">Down</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Activity</label>
                  <select value={mentalData.activityLevel} onChange={e => setMentalData({...mentalData, activityLevel: e.target.value as any})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold bg-white">
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Module 3: AI Wellness Assistant">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chronic Disease</label>
                <select value={physicalData.selectedDisease} onChange={e => setPhysicalData({...physicalData, selectedDisease: e.target.value})} className="w-full px-4 py-4 border border-slate-200 rounded-2xl font-black text-blue-700 bg-blue-50/50">
                  <option value="None">None</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Thyroid">Thyroid Issues</option>
                  <option value="Heart Disease">Heart Disease</option>
                </select>
              </div>
              {physicalData.selectedDisease !== 'None' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest ml-1">Specific Value (Sugar/BP)</label>
                  <input type="text" placeholder="e.g. 110 or 140/90" value={physicalData.specificValue} onChange={e => setPhysicalData({...physicalData, specificValue: e.target.value})} className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Symptoms/History</label>
                <textarea placeholder="Fatigue, dizziness, etc..." value={physicalData.medicalHistory} onChange={e => setPhysicalData({...physicalData, medicalHistory: e.target.value})} className="w-full px-4 py-4 border border-slate-200 rounded-2xl h-24 text-sm font-medium resize-none focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <button onClick={handleRunAnalysis} disabled={loading} className={`w-full py-5 rounded-[2rem] text-white font-black text-xl shadow-2xl transition-all active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}>
              {loading ? 'Processing...' : 'Run Full Analysis'}
            </button>
            {analysis && (
              <button onClick={generatePDF} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-md hover:bg-slate-50 transition-all">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export Full Clinical PDF
              </button>
            )}
            {error && <p className="text-red-500 text-[10px] font-black text-center bg-red-50 p-4 rounded-2xl uppercase">{error}</p>}
          </div>
        </div>

        {/* OUTPUT VIEWS */}
        <div className="lg:col-span-8">
          {analysis ? (
            <div className="min-h-screen">
              {currentView === 'dashboard' && renderDashboard()}
              {currentView === 'assessment' && renderAssessment()}
              {currentView === 'mental' && renderMentalWellness()}
              {currentView === 'support' && renderSupport()}
            </div>
          ) : (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-white rounded-[4rem] border-4 border-dashed border-slate-200 text-center p-24 group hover:border-blue-400 transition-all duration-700">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-10 text-blue-500 animate-pulse">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-5xl font-black text-slate-800 mb-8 tracking-tighter">Diagnostic Core Online</h2>
              <p className="text-slate-400 max-w-lg text-2xl leading-relaxed font-medium">Input physiological and mental data on the left to activate the AI stability modeling suite.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
