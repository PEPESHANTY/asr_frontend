"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, StopCircle } from "lucide-react";
import ApiClient, { TranscriptionOptions } from "@/lib/api-client";

interface AudioRecorderProps {
  apiClient: ApiClient;
  onTranscriptionStart: () => void;
  onTranscriptionEnd: () => void;
  onTranscriptionResult: (text: string) => void;
  onComparisonResults?: (results: any[]) => void;
  isTranscribing: boolean;
  model: string;
}

export default function AudioRecorder({
  apiClient,
  onTranscriptionStart,
  onTranscriptionEnd,
  onTranscriptionResult,
  onComparisonResults,
  isTranscribing,
  model,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [language, setLanguage] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('audio/webm');
  const [sampleRate, setSampleRate] = useState<number>(16000);

  // Disable translation for OmniLingual model
  const isTranslationSupported = model !== "omni_lingual";

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Get available audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        setAvailableDevices(audioDevices);
        if (audioDevices.length > 0 && !deviceId) {
          setDeviceId(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting audio devices:", error);
      }
    };
    getDevices();
  }, [deviceId]);

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          sampleRate: sampleRate,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Determine best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordedMimeType(mimeType);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Use the actual MIME type from the recorder
        const actualMimeType = mediaRecorderRef.current?.mimeType || mimeType;
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleTranscribe = async () => {
    if (!recordedBlob) return;

    onTranscriptionStart();
    try {
      // Convert blob to File with correct extension
      const extension = recordedMimeType.includes('webm') ? 'webm' : 
                       recordedMimeType.includes('mp4') ? 'mp4' : 'wav';
      const file = new File([recordedBlob], `recording_${Date.now()}.${extension}`, { type: recordedBlob.type });

      const options: TranscriptionOptions = {
        task: isTranslationSupported ? task : "transcribe", // Force transcribe for OmniLingual
        language: language || undefined,
        model: model, // Pass the model from props
      };

      const result = await apiClient.transcribeUpload(file, options);
      onTranscriptionResult(result.text);
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Transcription failed. Please check the console for details.");
    } finally {
      onTranscriptionEnd();
    }
  };

  const handleCompareModels = async () => {
    if (!recordedBlob || !onComparisonResults) return;

    onTranscriptionStart();
    try {
      // Convert blob to File with correct extension
      const extension = recordedMimeType.includes('webm') ? 'webm' : 
                       recordedMimeType.includes('mp4') ? 'mp4' : 'wav';
      const file = new File([recordedBlob], `recording_${Date.now()}.${extension}`, { type: recordedBlob.type });

      const options: TranscriptionOptions = {
        task: "transcribe", // Always use transcribe for comparison
        language: language || undefined,
      };

      console.log('Starting multi-model comparison with options:', options);
      const results = await apiClient.transcribeAllModels(file, options);
      console.log('Comparison results received:', results);
      onComparisonResults(results);
    } catch (error) {
      console.error("Comparison error:", error);
      alert("Comparison failed. Please check the console for details.");
    } finally {
      onTranscriptionEnd();
    }
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Record from Microphone</h3>
        <p className="text-gray-600 mb-4">
          Record audio from your microphone and transcribe or translate it.
        </p>
      </div>

      {/* Recording controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Rate
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={16000}>16000 Hz</option>
              <option value={22050}>22050 Hz</option>
              <option value={44100}>44100 Hz</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio Input Device
          </label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${availableDevices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center space-x-2"
            >
              <Square className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>
      </div>

      {/* Recorded audio preview */}
      {recordedUrl && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-800">Recorded Audio</h4>
            <button
              onClick={clearRecording}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <audio src={recordedUrl} controls className="flex-1" />
            <div className="text-sm text-gray-600">
              {recordedBlob && `Size: ${(recordedBlob.size / 1024).toFixed(1)} KB`}
            </div>
          </div>
        </div>
      )}

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

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={handleTranscribe}
          disabled={!recordedBlob || isTranscribing}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
            recordedBlob && !isTranscribing
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isTranscribing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Transcribe with {model === "whisper_jax" ? "Whisper" : model === "omni_lingual" ? "OmniLingual" : "Chunkformer"}</span>
            </>
          )}
        </button>

        {onComparisonResults && (
          <button
            onClick={handleCompareModels}
            disabled={!recordedBlob || isTranscribing}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
              recordedBlob && !isTranscribing
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isTranscribing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Compare All Models</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
