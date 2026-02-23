
import React from 'react';
import { ResumeData } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Cpu, FileUp, X, File } from 'lucide-react';
import { parseResumeText, parseResumeDocument } from '../services/geminiService';

interface ResumeAnalyzerProps {
  onAnalysisComplete: (data: ResumeData) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [text, setText] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [mode, setMode] = React.useState<'UPLOAD' | 'PASTE'>('UPLOAD');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported at this time.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (mode === 'PASTE' && !text.trim()) {
      setError('Please paste your resume text first.');
      return;
    }
    if (mode === 'UPLOAD' && !file) {
      setError('Please select a PDF file first.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    try {
      let result: ResumeData;
      if (mode === 'UPLOAD' && file) {
        const base64 = await fileToBase64(file);
        result = await parseResumeDocument(base64, file.type);
      } else {
        result = await parseResumeText(text);
      }
      onAnalysisComplete(result);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold dark:text-white mb-4 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent inline-block">
          AI Resume Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Upload your PDF or paste your text to get an instant ATS compatibility report.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-1 shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Toggle Mode */}
        <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-t-[2.25rem] border-b border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setMode('UPLOAD')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${mode === 'UPLOAD' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileUp size={18} />
            Upload PDF
          </button>
          <button 
            onClick={() => setMode('PASTE')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${mode === 'PASTE' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileText size={18} />
            Paste Text
          </button>
        </div>

        <div className="p-8 relative">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="relative">
                <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin" />
                <Cpu className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-6 text-xl font-bold text-indigo-600 animate-pulse">
                {mode === 'UPLOAD' ? 'Gemini is reading your PDF...' : 'Gemini is parsing your profile...'}
              </p>
              <p className="text-slate-500 mt-2">Extracting skills, experience, and keywords</p>
            </div>
          )}

          <div className="space-y-6">
            {mode === 'UPLOAD' ? (
              <div 
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50/50'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50');
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile && droppedFile.type === 'application/pdf') {
                    setFile(droppedFile);
                    setError('');
                  } else {
                    setError('Please drop a valid PDF file.');
                  }
                }}
                className={`w-full min-h-[320px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 group cursor-pointer ${
                  file 
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
                
                {file ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
                      <File size={40} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white truncate max-w-xs">{file.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="mt-6 flex items-center gap-2 mx-auto text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      <X size={18} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-4">
                      <Upload size={32} />
                    </div>
                    <p className="text-lg font-bold dark:text-white">Click or drag PDF to upload</p>
                    <p className="text-slate-500 text-sm mt-2">Maximum file size 10MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  className="w-full h-80 px-6 py-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 font-mono text-sm leading-relaxed"
                  placeholder="Paste the plain text from your PDF or Word resume here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {text && !isAnalyzing && (
                  <button 
                    onClick={() => setText('')}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full md:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 group"
              >
                <Cpu className="group-hover:rotate-12 transition-transform" />
                Deep Analyze {mode === 'UPLOAD' ? 'Document' : 'Resume'}
              </button>
              
              <div className="hidden md:flex items-center gap-6 px-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle size={16} className="text-emerald-500" />
                  ATS Check
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Skill Mapping
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<FileText className="text-indigo-600" />}
          title="Skill Extraction"
          desc="Identifies hard skills, soft skills, and specific tools automatically."
        />
        <FeatureCard 
          icon={<AlertCircle className="text-violet-600" />}
          title="Gap Analysis"
          desc="Spot missing industry keywords that recruiters search for."
        />
        <FeatureCard 
          icon={<CheckCircle className="text-emerald-600" />}
          title="ATS Optimization"
          desc="Calculates a score based on real-world parsing algorithms."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold mb-2 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
  </div>
);
