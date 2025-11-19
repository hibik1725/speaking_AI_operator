import VoiceAssistant from "@/components/VoiceAssistant";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          AI要件相談アシスタント
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          業務委託の要件を音声で相談し、最適な人材選定をサポートします
        </p>
        <VoiceAssistant />
      </div>
    </main>
  );
}
