"use client";

import { useState, useEffect } from "react";
import { Settings, Globe, Radio, Cpu } from "lucide-react";

interface SettingsPanelProps {
  apiEndpoint: string;
  onApiEndpointChange: (endpoint: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  task: "transcribe" | "translate";
  onTaskChange: (task: "transcribe" | "translate") => void;
}

export default function SettingsPanel({ 
  apiEndpoint, 
  onApiEndpointChange,
  model,
  onModelChange,
  language,
  onLanguageChange,
  task,
  onTaskChange
}: SettingsPanelProps) {
  const [whisperEndpoint, setWhisperEndpoint] = useState<string>("http://35.186.40.29:8008/transcribe");

  // Language options for different models
  const whisperLanguages = [
    { value: "en", label: "English" },
    { value: "vi", label: "Vietnamese" },
    { value: "hi", label: "Hindi" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "ru", label: "Russian" },
    { value: "ar", label: "Arabic" },
  ];

  const omniLingualLanguages = [
    { value: "eng_Latn", label: "English (Latin)" },
    { value: "vie_Latn", label: "Vietnamese (Latin)" },
    { value: "hin_Deva", label: "Hindi (Devanagari)" },
    { value: "fra_Latn", label: "French (Latin)" },
    { value: "deu_Latn", label: "German (Latin)" },
    { value: "spa_Latn", label: "Spanish (Latin)" },
    { value: "cmn_Hans", label: "Chinese (Simplified)" },
    { value: "cmn_Hant", label: "Chinese (Traditional)" },
    { value: "jpn_Jpan", label: "Japanese (Japanese)" },
    { value: "kor_Hang", label: "Korean (Hangul)" },
    { value: "rus_Cyrl", label: "Russian (Cyrillic)" },
    { value: "ara_Arab", label: "Arabic (Arabic)" },
    { value: "ita_Latn", label: "Italian (Latin)" },
    { value: "por_Latn", label: "Portuguese (Latin)" },
  ];

  // Model options
  const modelOptions = [
    { value: "whisper_jax", label: "Whisper JAX (TPU)" },
    { value: "omni_lingual", label: "OmniLingual API (External)" },
    { value: "chunkformer", label: "Chunkformer Vietnamese ASR" },
    { value: "qwen3_1_7B", label: "Qwen3 1.7B ASR" },
    { value: "qwen3_0_6B", label: "Qwen3 0.6B ASR" },
  ];

  // Get current language options based on model
  const getLanguageOptions = () => {
    if (model === "whisper_jax") {
      return whisperLanguages;
    } else if (model === "omni_lingual" || model === "qwen3_1_7B" || model === "qwen3_0_6B") {
      return omniLingualLanguages;
    } else if (model === "chunkformer") {
      return [{ value: "vi", label: "Vietnamese" }];
    }
    return whisperLanguages; // fallback
  };

  const handleApiEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiEndpointChange(e.target.value);
  };

  const handleWhisperEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhisperEndpoint(e.target.value);
  };


  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
    // Reset language to first option of new model
    let newOptions = whisperLanguages;
    if (e.target.value === "omni_lingual" || e.target.value === "qwen3_1_7B" || e.target.value === "qwen3_0_6B") {
      newOptions = omniLingualLanguages;
    } else if (e.target.value === "chunkformer") {
      newOptions = [{ value: "vi", label: "Vietnamese" }];
    }
    if (newOptions.length > 0 && !newOptions.some(opt => opt.value === language)) {
      onLanguageChange(newOptions[0].value);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(e.target.value);
  };

  const handleTaskChange = (newTask: "transcribe" | "translate") => {
    onTaskChange(newTask);
  };

  // Disable translation for OmniLingual models (they only support transcription)
  const isTranslationSupported = model === "whisper_jax";

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>ASR Model</span>
          </div>
        </label>
        <select
          value={model}
          onChange={handleModelChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {modelOptions.map((option) => ( 
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {model === "whisper_jax" && "TPU-based, supports transcription & translation"}
          {model === "omni_lingual" && "GPU server, 1600+ languages"}
          {model === "chunkformer" && "GPU server, Vietnamese only"}
          {model === "qwen3_1_7B" && "Qwen3 1.7B, multilingual on hanoi2"}
          {model === "qwen3_0_6B" && "Qwen3 0.6B, multilingual on hanoi2"}
        </p>
      </div>

      {/* API Endpoint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4" />
            <span>FastAPI Backend URL</span>
          </div>
        </label>
        <input
          type="text"
          value={apiEndpoint}
          onChange={handleApiEndpointChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="http://127.0.0.1:8000"
        />
      </div>

      {/* Task Selection - only show for whisper model */}
      {isTranslationSupported && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Task
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="transcribe"
                checked={task === "transcribe"}
                onChange={() => handleTaskChange("transcribe")}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2">Transcribe</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="translate"
                checked={task === "translate"}
                onChange={() => handleTaskChange("translate")}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2">Translate to English</span>
            </label>
          </div>
        </div>
      )}

      {/* Environment Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Settings stored in browser. API endpoints must be running on your server.
        </p>
        {(model === "omni_lingual" || model === "qwen3_1_7B" || model === "qwen3_0_6B") && (
          <p className="text-xs text-blue-800 mt-1">
            Only supports transcription, not translation.
          </p>
        )}
      </div>
    </div>
  );
}
