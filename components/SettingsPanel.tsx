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
  const [whisperEndpoint, setWhisperEndpoint] = useState<string>("http://127.0.0.1:8008/transcribe");

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
  ];

  // Get current language options based on model
  const getLanguageOptions = () => {
    if (model === "whisper_jax") {
      return whisperLanguages;
    } else if (model === "omni_lingual") {
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
    if (e.target.value === "omni_lingual") {
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
    <div className="space-y-6">
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
          {model === "whisper_jax" && "Whisper JAX model running on TPU (supports transcription & translation)"}
          {model === "omni_lingual" && "OmniLingual API model (gpu server, supports 1600+ languages)"}
          {model === "chunkformer" && "Chunkformer Vietnamese ASR model (gpu server, Vietnamese only)"}
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
        <p className="text-xs text-gray-500 mt-1">URL of the FastAPI ASR backend</p>
      </div>

      {/* Whisper Endpoint (only show for whisper model) */}
      {model === "whisper_jax" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Whisper JAX Endpoint</span>
            </div>
          </label>
          <input
            type="text"
            value={whisperEndpoint}
            onChange={handleWhisperEndpointChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="http://127.0.0.1:8008/transcribe"
          />
          <p className="text-xs text-gray-500 mt-1">URL of the Whisper JAX TPU server</p>
        </div>
      )}


      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Language</span>
          </div>
        </label>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {getLanguageOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {model === "whisper_jax" 
            ? "Language code for Whisper (e.g., 'en' for English)" 
            : "Language code with script for OmniLingual (e.g., 'eng_Latn' for English Latin)"}
        </p>
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

      {/* Advanced Settings */}
      <div className="pt-4 border-t">
        <h4 className="font-bold text-gray-800 mb-2">Advanced Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Beams (0 for default)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              defaultValue="0"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (0 for default)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              defaultValue="0"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Environment Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings are stored in your browser's local storage. The actual API endpoints must be running on your server.
        </p>
        {model.startsWith("omni_lingual") && (
          <p className="text-sm text-blue-800 mt-1">
            <strong>OmniLingual Note:</strong> Only supports transcription (not translation). For API version, ensure OMNILINGUAL_ENDPOINT and OMNILINGUAL_API_KEY are set in backend.
          </p>
        )}
      </div>
    </div>
  );
}
