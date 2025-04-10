import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <main className="flex items-center justify-center bg-gray-900 minh-h-screen">
      <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-full maw-w-lg">
        <h2 className="text-white text-2xl font-bold mb-4 text-center">Bienvenue sur SmartEnglish+</h2>
        <p className="mb-6 text-lg text-center">
          Connectez vous pour commencer le suivi de votre coaching en agnlais
        </p>
        <AuthForm />
      </div>
    </main>
  );
}
