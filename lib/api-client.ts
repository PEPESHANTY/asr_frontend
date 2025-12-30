import axios from 'axios';

export interface TranscriptionOptions {
  task?: 'transcribe' | 'translate';
  language?: string;
  num_beams?: number;
  temperature?: number;
  chunk_sec?: number;
  stride_leading?: number;
  stride_trailing?: number;
  prompt?: string;
}

export interface TranscriptionResult {
  text: string;
  task: string;
  language?: string;
  file_name?: string;
  file_size?: number;
  recorded_seconds?: number;
  sample_rate?: number;
}

export interface ModelInfo {
  name: string;
  endpoint: string;
  supported_languages: string[];
  tasks: string[];
}

export default class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<{
    available_models: string[];
    default_model: string;
    current_model: ModelInfo | null;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`);
      return response.data;
    } catch (error) {
      console.error('Failed to list models:', error);
      throw error;
    }
  }

  async transcribeUpload(
    file: File,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Add optional parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/transcribe/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  }

  async transcribeRecord(
    options: TranscriptionOptions & {
      seconds?: number;
      sample_rate?: number;
      device?: string;
    } = {}
  ): Promise<TranscriptionResult> {
    const formData = new FormData();

    // Add optional parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    // Set defaults
    if (!options.seconds) formData.append('seconds', '8.0');
    if (!options.sample_rate) formData.append('sample_rate', '16000');

    try {
      const response = await axios.post(
        `${this.baseUrl}/transcribe/record`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Recording transcription failed:', error);
      throw error;
    }
  }

  // TTS methods for Piper integration
  async synthesizeTTS(
    text: string,
    language: string = 'en',
    endpoint: string = 'http://127.0.0.1:8006/tts'
  ): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(
        endpoint,
        { text, lang: language },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      throw error;
    }
  }

  // Check if TTS endpoint is available
  async checkTTSEndpoint(endpoint: string = 'http://127.0.0.1:8006/tts'): Promise<boolean> {
    try {
      const response = await axios.get(endpoint);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
