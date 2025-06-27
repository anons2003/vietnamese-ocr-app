import NoSSR from '@/components/NoSSR';
import ImageToTextConverter from '@/components/ImageToTextConverter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Image to Text Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Extract text from images using advanced OCR technology
          </p>
        </header>
        <NoSSR
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <ImageToTextConverter />
        </NoSSR>
      </div>
    </div>
  );
}
