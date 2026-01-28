import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Loader2, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';
import { analyzeUrbanImage, generateImprovedImage } from '../services/visionService';

const PHASES = { UPLOAD: 'upload', ANALYZING: 'analyzing', RESULTS: 'results', GENERATING: 'generating', COMPLETE: 'complete' };

function ScoreBar({ label, score }) {
  const color = score >= 70 ? 'bg-leaf' : score >= 40 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary">{score}</span>
      </div>
      <div className="h-1.5 bg-forest rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function UrbanVisionPage() {
  const [phase, setPhase] = useState(PHASES.UPLOAD);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [improvedUrl, setImprovedUrl] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setPhase(PHASES.ANALYZING);

      try {
        const base64 = dataUrl.split(',')[1];
        const result = await analyzeUrbanImage(base64);
        setAnalysis(result);
        setPhase(PHASES.RESULTS);
      } catch (err) {
        setError(`Analysis failed: ${err.message}`);
        setPhase(PHASES.UPLOAD);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!analysis?.improvedImagePrompt) return;
    setPhase(PHASES.GENERATING);
    try {
      const url = await generateImprovedImage(analysis.improvedImagePrompt);
      setImprovedUrl(url);
      setPhase(PHASES.COMPLETE);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
      setPhase(PHASES.RESULTS);
    }
  };

  const reset = () => {
    setPhase(PHASES.UPLOAD);
    setPreview(null);
    setAnalysis(null);
    setImprovedUrl(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: phase !== PHASES.UPLOAD,
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="text-leaf" size={22} />
            <h1 className="text-2xl font-bold text-text-primary">Urban Vision AI</h1>
          </div>
          <p className="text-text-secondary text-sm">
            Upload a photo of any urban area to get an AI liveability assessment and a generated vision of improvements.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Upload Phase */}
        {phase === PHASES.UPLOAD && (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-leaf bg-leaf/5' : 'border-leaf/30 hover:border-leaf/60'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto text-leaf/50 mb-4" size={48} />
              <p className="text-text-primary font-medium">Drop an urban area image here</p>
              <p className="text-text-muted text-sm mt-1">or click to browse — PNG, JPG, WebP</p>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Upload', desc: 'Provide a street-level or aerial photo of an urban area' },
                { step: '2', title: 'Analyse', desc: 'GPT-4o scores greenery, infrastructure, cleanliness, accessibility & safety' },
                { step: '3', title: 'Reimagine', desc: 'Gemini generates an improved version based on AI suggestions' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-forest/50 border border-forest-light/30">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-leaf/20 text-leaf text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{item.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing Phase */}
        {phase === PHASES.ANALYZING && (
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest/50 border border-forest-light/50">
              <div className="w-14 h-14 rounded-full bg-forest-light/30" />
              <div className="flex-1 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-2 bg-forest-light/20 rounded-full" style={{ width: `${60 + i * 5}%` }} />
                ))}
              </div>
            </div>
            <div className="h-64 rounded-xl bg-forest-light/15" />
            <div className="text-center">
              <p className="text-text-muted text-sm">GPT-4o is evaluating the image...</p>
            </div>
          </div>
        )}

        {/* Results / Complete Phase */}
        {(phase === PHASES.RESULTS || phase === PHASES.GENERATING || phase === PHASES.COMPLETE) && analysis && (
          <div className="space-y-6">
            {/* Score Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-forest/50 border border-forest-light/50">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  analysis.overallScore >= 70 ? 'text-leaf' : analysis.overallScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {analysis.overallScore}
                </div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Score</div>
              </div>
              <div className="flex-1 space-y-2">
                {analysis.categories && Object.entries(analysis.categories).map(([key, val]) => (
                  <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={val.score} />
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2">Original</h3>
                <img src={preview} alt="Original" className="w-full rounded-xl border border-forest-light/30" />
              </div>
              {phase === PHASES.GENERATING && (
                <div className="flex items-center justify-center rounded-xl border border-forest-light/30 bg-forest/30 min-h-[200px]">
                  <div className="text-center">
                    <Loader2 className="mx-auto text-leaf animate-spin mb-2" size={28} />
                    <p className="text-text-muted text-xs">Generating improved version...</p>
                  </div>
                </div>
              )}
              {phase === PHASES.COMPLETE && improvedUrl && (
                <div>
                  <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2">AI Improved</h3>
                  <img src={improvedUrl} alt="Improved" className="w-full rounded-xl border border-forest-light/30" />
                </div>
              )}
            </div>

            {/* Issues & Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.issues?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h3 className="text-sm font-semibold text-rose-400 mb-2">Issues Found</h3>
                  <ul className="space-y-1">
                    {analysis.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-rose-400 mt-0.5">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.suggestions?.length > 0 && (
                <div className="p-4 rounded-xl bg-leaf/5 border border-forest-light/50">
                  <h3 className="text-sm font-semibold text-leaf mb-2">Suggestions</h3>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-leaf mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {phase === PHASES.RESULTS && (
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-leaf to-teal text-forest-dark font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={14} />
                  Generate Improved Version
                  <ChevronRight size={14} />
                </button>
              )}
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-forest-light/30 text-text-secondary text-sm hover:text-text-primary transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
