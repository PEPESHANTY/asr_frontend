"use client";

import { Clock, CheckCircle, XCircle, Copy } from "lucide-react";

interface ModelResult {
  model: string;
  result: { text: string } | null;
  error?: string;
  duration: number;
}

interface ModelComparisonProps {
  results: ModelResult[];
}

const MODEL_LABELS: Record<string, string> = {
  whisper_jax: "Whisper JAX",
  omni_lingual: "OmniLingual",
  chunkformer: "Chunkformer",
  qwen3: "Qwen3",
  qwen3_1_7B: "Qwen3 1.7B",
  qwen3_0_6B: "Qwen3 0.6B"
};

const MODEL_COLORS: Record<string, string> = {
  whisper_jax: "border-blue-300 bg-blue-50",
  omni_lingual: "border-green-300 bg-green-50",
  chunkformer: "border-purple-300 bg-purple-50",
  qwen3: "border-orange-300 bg-orange-50",
  qwen3_1_7B: "border-pink-300 bg-pink-50",
  qwen3_0_6B: "border-teal-300 bg-teal-50"
};

export default function ModelComparison({ results }: ModelComparisonProps) {
  const copyToClipboard = (text: string, modelName: string) => {
    navigator.clipboard.writeText(text);
    alert(`${modelName} transcription copied to clipboard!`);
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Model Comparison Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((item) => (
          <div
            key={item.model}
            className={`border-2 rounded-xl p-6 ${
              item.error 
                ? 'bg-red-50 border-red-200' 
                : MODEL_COLORS[item.model] || 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-gray-800">
                {MODEL_LABELS[item.model] || item.model}
              </h4>
              {item.error ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>

            {/* Timing */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Clock className="w-4 h-4" />
              <span>{(item.duration / 1000).toFixed(2)}s</span>
            </div>

            {/* Result or Error */}
            {item.error ? (
              <div className="text-sm text-red-700 bg-red-100 rounded-lg p-3">
                <p className="font-semibold mb-1">Error:</p>
                <p className="break-words">{item.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto mb-3">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">
                    {item.result?.text || 'No transcription text'}
                  </p>
                </div>
                {item.result?.text && (
                  <button
                    onClick={() => copyToClipboard(item.result.text, MODEL_LABELS[item.model])}
                    className="w-full py-2 px-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Statistics Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Successful: </span>
            <span className="font-bold text-green-600">
              {results.filter(r => !r.error).length} / {results.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fastest: </span>
            <span className="font-bold text-blue-600">
              {results.length > 0 && 
                MODEL_LABELS[results.reduce((min, r) => r.duration < min.duration ? r : min).model]
              } ({(Math.min(...results.map(r => r.duration)) / 1000).toFixed(2)}s)
            </span>
          </div>
          <div>
            <span className="text-gray-600">Slowest: </span>
            <span className="font-bold text-purple-600">
              {results.length > 0 && 
                MODEL_LABELS[results.reduce((max, r) => r.duration > max.duration ? r : max).model]
              } ({(Math.max(...results.map(r => r.duration)) / 1000).toFixed(2)}s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
