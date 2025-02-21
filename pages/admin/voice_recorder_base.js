// pages/recorder.js
'use client';

import { useState, useRef } from 'react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null); // Store the blob for API sending
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob); // Store the blob for API sending
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
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

  // Handle download
  const downloadRecording = () => {
    if (audioURL) {
      const link = document.createElement('a');
      link.href = audioURL;
      link.download = `recording-${new Date().toISOString()}.webm`;
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
      formData.append('audio', audioBlob, `recording-${new Date().toISOString()}.webm`);

      // Replace this URL with your actual API endpoint
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('API upload failed');
      }

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
    }
  };

  return (
    <div style={styles.container}>
      <h1>Audio Recorder</h1>
      
      <div style={{ margin: '20px 0' }}>
        {!isRecording ? (
          <button onClick={startRecording} style={styles.button}>
            Start Recording
          </button>
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

      {audioURL && (
        <div style={styles.preview}>
          <h3>Preview:</h3>
          <audio controls src={audioURL} />
        </div>
      )}
    </div>
  );
}
