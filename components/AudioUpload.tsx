"use client";

import { useState, useRef } from "react";
import { Upload, FileAudio, X } from "lucide-react";
import ApiClient, { TranscriptionOptions } from "@/lib/api-client";

interface AudioUploadProps {
  apiClient: ApiClient;
  onTranscriptionStart: () => void;
  onTranscriptionEnd: () => void;
  onTranscriptionResult: (text: string) => void;
  isTranscribing: boolean;
  model: string;
}

export default function AudioUpload({
  apiClient,
  onTranscriptionStart,
  onTranscriptionEnd,
  onTranscriptionResult,
  isTranscribing,
  model,
}: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [language, setLanguage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disable translation for OmniLingual model
  const isTranslationSupported = model !== "omni_lingual";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    onTranscriptionStart();
    try {
      const options: TranscriptionOptions = {
        task: isTranslationSupported ? task : "transcribe", // Force transcribe for OmniLingual
        language: language || undefined,
        model: model, // Pass the model from props
      };

      console.log('Starting transcription with options:', options);
      const result = await apiClient.transcribeUpload(selectedFile, options);
      console.log('Transcription result received:', result);
      onTranscriptionResult(result.text);
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Transcription failed. Please check the console for details.");
    } finally {
      onTranscriptionEnd();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Audio File</h3>
        <p className="text-gray-600 mb-4">
          Upload an audio file (WAV, MP3, M4A, OGG, FLAC) for transcription or translation.
        </p>
      </div>

      {/* File upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center ${
          selectedFile
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".wav,.mp3,.m4a,.ogg,.flac"
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <FileAudio className="w-12 h-12 text-primary-600 mb-4" />
            <p className="text-gray-800 font-medium">{fileName}</p>
            <p className="text-gray-600 text-sm mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Remove File</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-700">Click to upload or drag and drop</p>
            <p className="text-gray-500 text-sm mt-1">WAV, MP3, M4A, OGG, FLAC</p>
          </div>
        )}
      </div>

      {/* Transcription options */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-3">Transcription Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={task === "transcribe"}
                  onChange={() => setTask("transcribe")}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Transcribe</span>
              </label>
              {isTranslationSupported && (
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={task === "translate"}
                    onChange={() => setTask("translate")}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">Translate to English</span>
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language Hint (optional)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Auto-detect</option>
              {model === "whisper_jax" ? (
                <>
                  <option value="en">English</option>
                  <option value="vi">Vietnamese</option>
                  <option value="hi">Hindi</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                  <option value="zh">Chinese</option>
                </>
              ) : (
                <>
                  <option value="eng_Latn">English (Latin)</option>
                  <option value="vie_Latn">Vietnamese (Latin)</option>
                  <option value="hin_Deva">Hindi (Devanagari)</option>
                  <option value="fra_Latn">French (Latin)</option>
                  <option value="deu_Latn">German (Latin)</option>
                  <option value="spa_Latn">Spanish (Latin)</option>
                  <option value="cmn_Hans">Chinese (Simplified)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Transcribe button */}
      <button
        onClick={handleTranscribe}
        disabled={!selectedFile || isTranscribing}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
          selectedFile && !isTranscribing
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isTranscribing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Transcribing...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Transcribe Audio</span>
          </>
        )}
      </button>
    </div>
  );
}
