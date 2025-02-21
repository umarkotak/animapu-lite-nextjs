// pages/recorder.js
'use client';

import { useState, useRef, useEffect } from 'react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const autoStopTimerRef = useRef(null);

  // Duration for auto-stop in milliseconds (e.g., 5000ms = 5 seconds)
  // const AUTO_STOP_DURATION = 5000;
  const AUTO_STOP_DURATION = 1000;

  // Convert Blob to WAV
  const convertToWav = async (blob) => {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer) => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * numberOfChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * numberOfChannels * 2, true);

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(44 + (i * numberOfChannels + channel) * 2, value | 0, true);
      }
    }

    return arrayBuffer;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Start regular recording
  const startRecording = async () => {
    await startRecordingBase(false);
  };

  // Start recording with auto-stop
  const startAutoStopRecording = async () => {
    await startRecordingBase(true);
  };

  // Base recording function
  const startRecordingBase = async (autoStop = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(webmBlob);
        const audioUrl = URL.createObjectURL(wavBlob);
        setAudioURL(audioUrl);
        setAudioBlob(wavBlob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
        audioContextRef.current.close();
        cancelAnimationFrame(animationFrameRef.current);
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
        }
      };

      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      drawWaveform();

      if (autoStop) {
        autoStopTimerRef.current = setTimeout(() => {
          stopRecording();
        }, AUTO_STOP_DURATION);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Draw waveform
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0070f3';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // Handle download
  const downloadRecording = () => {
    if (audioURL) {
      const link = document.createElement('a');
      link.href = audioURL;
      link.download = `recording-${new Date().toISOString()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Send to API
  const sendToAPI = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${new Date().toISOString()}.wav`);

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API upload failed');
      const result = await response.json();
      console.log('API response:', result);
      alert('Audio successfully uploaded to API!');
    } catch (error) {
      console.error('Error sending to API:', error);
      alert('Failed to upload audio to API');
    } finally {
      setIsSending(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    button: {
      padding: '10px 20px',
      marginRight: '10px',
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      opacity: isSending ? 0.6 : 1,
    },
    preview: {
      marginTop: '20px',
    },
    canvas: {
      width: '100%',
      height: '200px',
      backgroundColor: '#f0f0f0',
      display: isRecording ? 'block' : 'none',
    }
  };

  return (
    <div style={styles.container}>
      <h1>Audio Recorder</h1>
      
      <div style={{ margin: '20px 0' }}>
        {!isRecording ? (
          <>
            <button onClick={startRecording} style={styles.button}>
              Start Recording
            </button>
            <button onClick={startAutoStopRecording} style={styles.button}>
              Start Auto-Stop Recording ({AUTO_STOP_DURATION/1000}s)
            </button>
          </>
        ) : (
          <button onClick={stopRecording} style={styles.button}>
            Stop Recording
          </button>
        )}
        
        {audioURL && (
          <>
            <button onClick={downloadRecording} style={styles.button}>
              Download Recording
            </button>
            <button 
              onClick={sendToAPI} 
              style={styles.button}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send to API'}
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} style={styles.canvas} width="600" height="200" />

      {audioURL && (
        <div style={styles.preview}>
          <h3>Preview:</h3>
          <audio controls src={audioURL} />
        </div>
      )}
    </div>
  );
}