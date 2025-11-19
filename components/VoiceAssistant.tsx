'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // 接続開始
  const startConversation = useCallback(async () => {
    setIsConnecting(true);

    try {
      // セッションを作成
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const { session } = await sessionResponse.json();
      sessionIdRef.current = session.id;

      // OpenAI Realtime APIのエフェメラルキーを取得
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: 'alloy' }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token');
      }

      const data = await tokenResponse.json();
      const ephemeralKey = data.client_secret.value;

      // WebRTC接続を確立
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // マイク入力を取得
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // オーディオトラックを追加
      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream);
      });

      // リモートオーディオを設定
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };

      // データチャネルを作成
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        handleRealtimeEvent(msg);
      });

      // Offerを作成
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // OpenAI Realtime APIに接続
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setIsConnected(true);
      setIsConnecting(false);

      // 挨拶メッセージを送信
      sendRealtimeEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'こんにちは。業務委託の要件定義について相談したいです。',
            },
          ],
        },
      });

      sendRealtimeEvent({ type: 'response.create' });

    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      alert('音声接続の開始に失敗しました。マイクの権限を確認してください。');
    }
  }, []);

  // 接続終了
  const stopConversation = useCallback(async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    // セッションを終了
    if (sessionIdRef.current) {
      // セッション終了の処理をここに追加可能
      sessionIdRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Realtime APIイベントを送信
  const sendRealtimeEvent = (event: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(event));
    }
  };

  // Realtime APIイベントを処理
  const handleRealtimeEvent = (event: any) => {
    console.log('Received event:', event);

    switch (event.type) {
      case 'conversation.item.created':
        if (event.item.type === 'message') {
          const content = event.item.content?.[0]?.transcript || event.item.content?.[0]?.text || '';
          if (content) {
            setMessages((prev) => [
              ...prev,
              {
                role: event.item.role,
                content: content,
                timestamp: new Date(),
              },
            ]);
          }
        }
        break;

      case 'response.audio_transcript.delta':
        setCurrentTranscript((prev) => prev + event.delta);
        break;

      case 'response.audio_transcript.done':
        if (event.transcript) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: event.transcript,
              timestamp: new Date(),
            },
          ]);
          setCurrentTranscript('');
        }
        break;

      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        break;

      case 'response.function_call_arguments.done':
        // Function Callingの処理
        if (event.name === 'save_requirement') {
          handleSaveRequirement(JSON.parse(event.arguments));
        }
        break;

      case 'error':
        console.error('Realtime API error:', event.error);
        break;
    }
  };

  // 要件を保存
  const handleSaveRequirement = async (args: any) => {
    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...args,
          session_id: sessionIdRef.current,
        }),
      });

      if (response.ok) {
        const { requirement } = await response.json();
        console.log('Requirement saved:', requirement);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '要件を保存しました！内容を確認してください。',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving requirement:', error);
    }
  };

  // ミュート切り替え
  const toggleMute = () => {
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      senders.forEach((sender) => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = isMuted;
        }
      });
      setIsMuted(!isMuted);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      {/* 接続状態 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isConnected ? '接続中' : '未接続'}
          </span>
        </div>

        {/* コントロールボタン */}
        <div className="flex gap-3">
          {isConnected && (
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              aria-label={isMuted ? 'ミュート解除' : 'ミュート'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          {!isConnected ? (
            <button
              onClick={startConversation}
              disabled={isConnecting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-full transition-colors flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  接続中...
                </>
              ) : (
                <>
                  <Mic size={20} />
                  会話を開始
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopConversation}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors"
            >
              会話を終了
            </button>
          )}
        </div>
      </div>

      {/* メッセージ履歴 */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-20">
            <Mic size={48} className="mx-auto mb-4 opacity-50" />
            <p>「会話を開始」ボタンを押して</p>
            <p>AIアシスタントとの相談を始めましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}

            {/* リアルタイム文字起こし */}
            {currentTranscript && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  <p className="text-sm whitespace-pre-wrap italic">
                    {currentTranscript}
                    <span className="animate-pulse">...</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>💡 AIに業務内容、必要なスキル、予算などを話してみてください</p>
        <p>AIが要件を整理し、最適な人材像を一緒に考えます</p>
      </div>
    </div>
  );
}
