"use client";

import { useState } from "react";
import { Settings, Globe, Radio } from "lucide-react";

interface SettingsPanelProps {
  apiEndpoint: string;
  onApiEndpointChange: (endpoint: string) => void;
}

export default function SettingsPanel({ apiEndpoint, onApiEndpointChange }: SettingsPanelProps) {
  const [whisperEndpoint, setWhisperEndpoint] = useState<string>("http://127.0.0.1:8008/transcribe");
  const [piperEndpoint, setPiperEndpoint] = useState<string>("http://127.0.0.1:8006/tts");
  const [language, setLanguage] = useState<string>("en");
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");

  const handleApiEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiEndpointChange(e.target.value);
  };

  const handleWhisperEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhisperEndpoint(e.target.value);
  };

  const handlePiperEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPiperEndpoint(e.target.value);
  };

  return (
    <div className="space-y-6">
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

      {/* Whisper Endpoint */}
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

      {/* Piper TTS Endpoint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4" />
            <span>Piper TTS Endpoint</span>
          </div>
        </label>
        <input
          type="text"
          value={piperEndpoint}
          onChange={handlePiperEndpointChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="http://127.0.0.1:8006/tts"
        />
        <p className="text-xs text-gray-500 mt-1">URL of the Piper TTS server</p>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Default Language</span>
          </div>
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="es">Spanish</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* Task Selection */}
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
              onChange={() => setTask("transcribe")}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2">Transcribe</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="translate"
              checked={task === "translate"}
              onChange={() => setTask("translate")}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2">Translate to English</span>
          </label>
        </div>
      </div>

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
      </div>
    </div>
  );
}
