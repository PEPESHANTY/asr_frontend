import axios from 'axios';
import https from 'https';

export interface TranscriptionOptions {
  task?: 'transcribe' | 'translate';
  language?: string;
  model?: string;
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
    
    // Configure axios to bypass SSL certificate verification (for testing only)
    axios.defaults.httpsAgent = new https.Agent({  
      rejectUnauthorized: false
    });
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
      console.log(`Sending transcription request to ${this.baseUrl}/transcribe/upload`, {
        file: file.name,
        size: file.size,
        options
      });
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
      console.log('Transcription response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Transcription failed:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
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

}
