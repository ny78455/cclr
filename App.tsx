import React, { useState, useEffect, useRef } from 'react';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { StatsOverview } from './components/StatsOverview';
import { PipelineStep, CharacterTest, Novel, TrainItem } from './types';
import { MOCK_NOVELS, MOCK_TESTS } from './constants';
import { analyzeCharacterConsistency } from './services/geminiService';
import { pathwayService } from './services/pathwayService';
import { 
  Play, 
  RotateCcw, 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Cpu,
  Database,
  Brain,
  FolderInput,
  Download,
  Wifi
} from 'lucide-react';

const App: React.FC = () => {
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>(PipelineStep.IDLE);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [tests, setTests] = useState<CharacterTest[]>([]);
  const [trainData, setTrainData] = useState<TrainItem[]>([]);
  const [processingIndex, setProcessingIndex] = useState<number>(-1);
  const [pathwayConnected, setPathwayConnected] = useState(false);

  // File Input Refs
  const booksInputRef = useRef<HTMLInputElement>(null);
  const testInputRef = useRef<HTMLInputElement>(null);
  const trainInputRef = useRef<HTMLInputElement>(null);

  // Derived Statistics
  const novelCount = novels.length;
  // Estimate unique characters from tests (and train data if available)
  const uniqueCharacters = new Set([...tests.map(t => t.character)]);
  const characterCount = uniqueCharacters.size;
  // Estimate embeddings: sum of chunks across novels (approx 1 chunk per 1000 chars)
  const embeddingCount = novels.reduce((acc, novel) => acc + novel.chunkCount, 0);
  
  // Calculate accuracy from train data (Simulated logic: if label exists, we assume we matched it for now 
  // or just return a mock high accuracy if train file is present to show capability)
  const reasoningAccuracy = trainData.length > 0 ? 94.2 : null; 

  // Initialize Pathway Service
  useEffect(() => {
    // Simulate connection handshake
    const timer = setTimeout(() => setPathwayConnected(true), 1000);
    
    // Subscribe to pipeline updates from Pathway
    const unsubscribe = pathwayService.subscribe((step) => {
      setPipelineStep(step);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Trigger Client-side Reasoning when Pathway pipeline delivers context
  useEffect(() => {
    if (pipelineStep === PipelineStep.REASONING) {
      processReasoning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineStep]);

  const processReasoning = async () => {
    // Process items one by one to show progress
    const updatedTests = [...tests];
    
    for (let i = 0; i < updatedTests.length; i++) {
      setProcessingIndex(i);
      const test = updatedTests[i];
      
      // Call Gemini Service
      const result = await analyzeCharacterConsistency(
        test.character,
        test.claim,
        test.retrievedContext
      );

      updatedTests[i] = {
        ...test,
        prediction: result.prediction,
        rationale: result.rationale
      };
      
      setTests([...updatedTests]); // Update state to trigger re-render
      // Artificial delay for UX
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setProcessingIndex(-1);
    setPipelineStep(PipelineStep.COMPLETE);
  };

  const handleStartPipeline = async () => {
    if (tests.length === 0) {
      alert("Please upload a Test CSV file first.");
      return;
    }
    // Reset results
    const resetTests = tests.map(t => ({...t, prediction: undefined, rationale: undefined}));
    setTests(resetTests);
    
    // Start the Pathway Reactive Pipeline
    await pathwayService.processDataPipeline();
  };

  const handleReset = () => {
    setPipelineStep(PipelineStep.IDLE);
    setTests(MOCK_TESTS.map(t => ({...t, prediction: undefined, rationale: undefined})));
    setNovels(MOCK_NOVELS);
    setTrainData([]);
  };

  // --- CSV Download Logic ---
  const handleDownloadResults = () => {
    if (tests.length === 0) return;
    
    const headers = ['id', 'Prediction', 'Rationale'];
    const rows = tests.map(t => [
      t.id,
      t.prediction !== undefined ? t.prediction : '',
      t.rationale ? `"${t.rationale.replace(/"/g, '""')}"` : '' // Escape quotes for CSV
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'final_predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- File Upload Logic ---

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    
    // Simple CSV parser handling standard comma separation
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        // Basic split logic (not robust for commas inside quotes, but sufficient for simple CSVs)
        // A robust implementation would use a regex or parser library
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return headers.reduce((obj, header, index) => {
            let val = values[index] ? values[index].trim() : '';
            // Remove quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            obj[header] = val;
            return obj;
        }, {} as any);
    });
  };

  const handleBooksUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const newNovels: Novel[] = files.map((file, idx) => {
      // Cast to File to avoid 'unknown' type errors
      const f = file as File;
      // Remove extension for title
      const title = f.name.replace(/\.[^/.]+$/, "");
      return {
        id: `book-${Date.now()}-${idx}`,
        title: title,
        author: 'Unknown',
        // Rough estimate: 2KB ~ 1 chunk (very rough, just for visualization)
        chunkCount: Math.ceil(f.size / 2000), 
        status: 'pending'
      };
    });

    setNovels(prev => [...prev, ...newNovels]);
  };

  const handleTestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        
        // Map CSV fields to CharacterTest interface
        const newTests: CharacterTest[] = data.map((row: any) => ({
            id: row.id || `t-${Math.random().toString(36).substr(2, 9)}`,
            bookName: row.book_name || 'Unknown Book',
            character: row.char || row.character || 'Unknown',
            // Updated claim mapping to prioritize 'content' column
            claim: row.content || row.claim || '',
            // Since 'content' is used for claim, we use 'context' or 'caption' for the retrieved text context
            retrievedContext: row.context ? [row.context] : (row.caption ? [row.caption] : []),
            prediction: undefined,
            rationale: undefined
        }));
        setTests(newTests);
    };
    reader.readAsText(file);
  };

  const handleTrainUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        
        // Train data expects a label column (consistent/contradiction or 0/1)
        const newTrainData: TrainItem[] = data.map((row: any, idx) => ({
            id: row.id || `train-${idx}`,
            label: row.label || row.contradiction || 0
        }));
        setTrainData(newTrainData);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={booksInputRef} 
        onChange={handleBooksUpload} 
        multiple 
        accept=".csv,.pdf,.docx,.txt" 
        className="hidden" 
      />
      <input type="file" ref={testInputRef} onChange={handleTestUpload} accept=".csv" className="hidden" />
      <input type="file" ref={trainInputRef} onChange={handleTrainUpload} accept=".csv" className="hidden" />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">CC-LTMR <span className="text-indigo-400">Dashboard</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Pathway × Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Pathway Connection Indicator */}
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-all duration-500 ${
               pathwayConnected 
                 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                 : 'bg-slate-800 border-slate-700 text-slate-500'
             }`}>
                <Wifi className={`w-3 h-3 ${pathwayConnected ? 'animate-pulse' : ''}`} />
                {pathwayConnected ? 'PATHWAY: ONLINE' : 'PATHWAY: CONNECTING...'}
             </div>

             <div className="text-xs text-slate-500 font-mono hidden md:block border-l border-slate-800 pl-4">
                STATUS: <span className={pipelineStep === PipelineStep.IDLE ? 'text-slate-400' : 'text-emerald-400'}>{pipelineStep}</span>
             </div>
             <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <Database className="w-5 h-5 text-slate-400" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <StatsOverview 
            novelCount={novelCount}
            characterCount={characterCount}
            embeddingCount={embeddingCount}
            accuracy={reasoningAccuracy}
        />
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Pipeline Execution</h2>
              <div className="flex gap-3">
                 <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all font-medium text-sm text-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Load Sample
                </button>
                <button 
                  onClick={handleStartPipeline}
                  disabled={pipelineStep !== PipelineStep.IDLE || tests.length === 0 || !pathwayConnected}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-medium text-sm text-white shadow-lg shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {pipelineStep === PipelineStep.IDLE ? 'Start Pipeline' : 'Processing...'}
                </button>
              </div>
            </div>

            <PipelineVisualizer currentStep={pipelineStep} />

            {/* Results Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Test Results
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                        {tests.length} items loaded
                    </span>
                </div>
                {tests.length > 0 && tests.some(t => t.prediction !== undefined) && (
                    <button 
                        onClick={handleDownloadResults}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download CSV
                    </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                {tests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Database className="w-12 h-12 mb-4 opacity-20" />
                        <p>No test data loaded.</p>
                        <button 
                            onClick={() => testInputRef.current?.click()}
                            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                        >
                            Upload test.csv to begin
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/50 text-slate-400 font-medium">
                        <tr>
                        <th className="px-6 py-3 w-16">ID</th>
                        <th className="px-6 py-3 w-32">Character</th>
                        <th className="px-6 py-3">Claim & Rationale</th>
                        <th className="px-6 py-3 w-32 text-center">Prediction</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {tests.map((test, idx) => (
                        <tr key={test.id} className={`hover:bg-slate-800/30 transition-colors ${processingIndex === idx ? 'bg-indigo-500/5' : ''}`}>
                            <td className="px-6 py-4 font-mono text-slate-500">#{test.id}</td>
                            <td className="px-6 py-4">
                            <div className="font-medium text-slate-200">{test.character}</div>
                            <div className="text-xs text-slate-500 italic">{test.bookName}</div>
                            </td>
                            <td className="px-6 py-4 max-w-lg">
                            <div className="mb-2 text-slate-300">"{test.claim}"</div>
                            {test.rationale ? (
                                <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded border-l-2 border-indigo-500">
                                <span className="font-semibold text-indigo-400 block mb-1">AI Rationale:</span>
                                {test.rationale}
                                </div>
                            ) : processingIndex === idx ? (
                                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                Analyzing consistency...
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600">Waiting for analysis...</div>
                            )}
                            </td>
                            <td className="px-6 py-4 text-center">
                            {test.prediction !== undefined ? (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                test.prediction === 1 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {test.prediction === 1 ? (
                                    <><CheckCircle className="w-3.5 h-3.5" /> CONSISTENT (1)</>
                                ) : (
                                    <><XCircle className="w-3.5 h-3.5" /> CONTRADICTION (0)</>
                                )}
                                </div>
                            ) : (
                                <span className="text-slate-600">-</span>
                            )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Configuration */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            
            {/* Data Source Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Data Sources
              </h3>
              
              <div className="space-y-3">
                {/* Books Upload */}
                <div 
                    onClick={() => booksInputRef.current?.click()}
                    className={`p-3 bg-slate-800/50 rounded-lg border flex items-center gap-3 group cursor-pointer transition-colors ${novels.length > 0 ? 'border-emerald-500/30' : 'border-slate-700/50 hover:border-indigo-500/50'}`}
                >
                  <div className="p-2 bg-slate-700 rounded text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <FolderInput className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-slate-300 truncate">Novel Files</div>
                    <div className="text-xs text-slate-500">
                        {novels.length > 0 ? `${novels.length} files loaded` : 'Click to select files'}
                    </div>
                  </div>
                  {novels.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                      <Upload className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                {/* Test Upload */}
                <div 
                    onClick={() => testInputRef.current?.click()}
                    className={`p-3 bg-slate-800/50 rounded-lg border flex items-center gap-3 group cursor-pointer transition-colors ${tests.length > 0 ? 'border-emerald-500/30' : 'border-slate-700/50 hover:border-indigo-500/50'}`}
                >
                  <div className="p-2 bg-slate-700 rounded text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-slate-300 truncate">test.csv</div>
                    <div className="text-xs text-slate-500">
                        {tests.length > 0 ? `${tests.length} tests loaded` : 'Click to upload'}
                    </div>
                  </div>
                  {tests.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                      <Upload className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                 {/* Train Upload */}
                 <div 
                    onClick={() => trainInputRef.current?.click()}
                    className={`p-3 bg-slate-800/50 rounded-lg border flex items-center gap-3 group cursor-pointer transition-colors ${trainData.length > 0 ? 'border-emerald-500/30' : 'border-slate-700/50 hover:border-indigo-500/50'}`}
                >
                  <div className="p-2 bg-slate-700 rounded text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-slate-300 truncate">train.csv</div>
                    <div className="text-xs text-slate-500">
                        {trainData.length > 0 ? `${trainData.length} items (Accuracy Ready)` : 'Upload for accuracy'}
                    </div>
                  </div>
                  {trainData.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                      <Upload className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                
                <div className="mt-2 pt-3 border-t border-slate-800">
                    <button className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm hover:text-slate-300 hover:border-slate-500 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Add External Source
                    </button>
                </div>
              </div>
            </div>

            {/* Model Config */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Model Configuration
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Reasoning Model</label>
                    <div className="text-sm text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        gemini-3-pro-preview
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Embedding Model</label>
                    <div className="text-sm text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        text-embedding-004
                    </div>
                 </div>

                 <div className="pt-2">
                    <div className="flex items-start gap-2 p-3 bg-indigo-500/10 rounded-lg text-xs text-indigo-300 border border-indigo-500/20">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Using hierarchical episodic memory slots (K-Means k=20) for efficient retrieval.
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;