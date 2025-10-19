import React, { useState, useRef } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onTranscript, onRecordingStart, onRecordingStop, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  React.useEffect(() => {
    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        toast.error('语音识别失败，请重试');
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognition);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  const startRecording = () => {
    if (!isSupported) {
      toast.error('您的浏览器不支持语音识别功能');
      return;
    }

    if (disabled) {
      toast.error('请先填写基本信息');
      return;
    }

    try {
      recognition.start();
      setIsRecording(true);
      onRecordingStart && onRecordingStart();
      toast.success('开始录音，请说话...');
    } catch (error) {
      console.error('开始录音失败:', error);
      toast.error('开始录音失败，请重试');
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
      onRecordingStop && onRecordingStop();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          您的浏览器不支持语音识别功能，请使用Chrome或Safari浏览器
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
        
        {isRecording && (
          <div className="absolute -inset-4 border-4 border-red-500 rounded-full animate-ping"></div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isRecording ? '正在录音，请说话...' : '点击麦克风开始语音输入'}
        </p>
        {isRecording && (
          <p className="text-xs text-red-600 mt-1">
            点击停止按钮结束录音
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
