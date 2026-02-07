"use client";

import { useState } from "react";
import { Upload, Mic, Settings, Download } from "lucide-react";
import ApiClient from "@/lib/api-client";
import AudioUpload from "@/components/AudioUpload";
import AudioRecorder from "@/components/AudioRecorder";
import SettingsPanel from "@/components/SettingsPanel";
import ModelComparison from "@/components/ModelComparison";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    process.env.NEXT_PUBLIC_ASR_API_ENDPOINT || "https://asr-models.backend4.pe"
  );
  const [model, setModel] = useState<string>("whisper_jax");
  const [language, setLanguage] = useState<string>("en");
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [comparisonResults, setComparisonResults] = useState<any[] | null>(null);

  const apiClient = new ApiClient(apiEndpoint);

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    // Update language to appropriate default for the model
    if (newModel === "omni_lingual") {
      setLanguage("eng_Latn");
    } else if (newModel === "qwen3_1_7B" || newModel === "qwen3_0_6B") {
      setLanguage("eng_Latn");
    } else if (newModel === "chunkformer") {
      setLanguage("vi");
    } else {
      setLanguage("en");
    }
  };

  const handleTranscriptionResult = (text: string) => {
    console.log('Transcription result received:', text);
    setTranscription(text);
    setComparisonResults(null); // Clear comparison when showing single result
  };

  const handleComparisonResults = (results: any[]) => {
    console.log('Comparison results received:', results);
    setComparisonResults(results);
    setTranscription(''); // Clear single result when showing comparison
  };

  const handleTranscriptionStart = () => {
    setIsTranscribing(true);
  };

  const handleTranscriptionEnd = () => {
    setIsTranscribing(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar for settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-800">ASR Settings</h2>
            </div>
            
            <SettingsPanel 
              apiEndpoint={apiEndpoint}
              onApiEndpointChange={setApiEndpoint}
              model={model}
              onModelChange={handleModelChange}
              language={language}
              onLanguageChange={setLanguage}
              task={task}
              onTaskChange={setTask}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeTab === "upload"
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Audio File</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-4 px-6 text-center font-medium ${
                    activeTab === "record"
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("record")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Record from Microphone</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "upload" ? (
                <AudioUpload
                  apiClient={apiClient}
                  onTranscriptionStart={handleTranscriptionStart}
                  onTranscriptionEnd={handleTranscriptionEnd}
                  onTranscriptionResult={handleTranscriptionResult}
                  onComparisonResults={handleComparisonResults}
                  isTranscribing={isTranscribing}
                  model={model}
                />
              ) : (
                <AudioRecorder
                  apiClient={apiClient}
                  onTranscriptionStart={handleTranscriptionStart}
                  onTranscriptionEnd={handleTranscriptionEnd}
                  onTranscriptionResult={handleTranscriptionResult}
                  onComparisonResults={handleComparisonResults}
                  isTranscribing={isTranscribing}
                  model={model}
                />
              )}

              {/* Single Transcription Result */}
              {transcription && !comparisonResults && (
                <div className="mt-8 border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Transcription Result</h3>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        onClick={() => {
                          const blob = new Blob([transcription], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `transcription_${Date.now()}.txt`;
                          a.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      className="w-full h-64 bg-transparent resize-none focus:outline-none"
                      value={transcription}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Comparison Results */}
              {comparisonResults && (
                <ModelComparison results={comparisonResults} />
              )}
            </div>
          </div>

          {/* API Health Check */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">API Status</h3>
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${apiEndpoint ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-gray-600">
                  {apiEndpoint ? `Backend API Connection check` : "Not connected"}
                </span>
                <button
                  className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  onClick={async () => {
                    try {
                      const response = await fetch(`${apiEndpoint}/health`);
                      if (response.ok) {
                        alert("API is healthy!");
                      } else {
                        alert("API health check failed");
                      }
                    } catch (error) {
                      alert("Failed to connect to API");
                    }
                  }}
                >
                  Check Health
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
