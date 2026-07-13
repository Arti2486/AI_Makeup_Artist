import { useState } from 'react';
import LandingPage from './components/LandingPage';
import UploadPage from './components/UploadPage';
import AnalysisPage, { FaceAnalysis } from './components/AnalysisPage';
import MakeupPage from './components/MakeupPage';
import AIAssistant from './components/AIAssistant';
import SplashScreen from './components/SplashScreen';

type Page = 'splash' | 'landing' | 'upload' | 'analysis' | 'makeup';

export default function App() {
  const [page, setPage] = useState<Page>('splash');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);

  const handleImageReady = (url: string) => {
    setImageUrl(url);
    setPage('analysis');
  };

  const handleAnalysisComplete = (result: FaceAnalysis) => {
    setAnalysis(result);
    setPage('makeup');
  };

  const handleBack = () => {
    if (page === 'upload') setPage('landing');
    else if (page === 'analysis') setPage('upload');
    else if (page === 'makeup') setPage('analysis');
  };

  return (
    <div className="min-h-screen">
      {page === 'splash' && (
        <SplashScreen onDone={() => setPage('landing')} />
      )}

      {page === 'landing' && (
        <LandingPage onGetStarted={() => setPage('upload')} />
      )}

      {page === 'upload' && (
        <UploadPage
          onImageReady={handleImageReady}
          onBack={() => setPage('landing')}
        />
      )}

      {page === 'analysis' && imageUrl && (
        <AnalysisPage
          imageUrl={imageUrl}
          onContinue={handleAnalysisComplete}
          onBack={handleBack}
        />
      )}

      {page === 'makeup' && imageUrl && analysis && (
        <MakeupPage
          imageUrl={imageUrl}
          analysis={analysis}
          onBack={handleBack}
        />
      )}

      {/* AI Assistant - always visible except on landing */}
      {page !== 'landing' && (
        <AIAssistant analysis={analysis} />
      )}
    </div>
  );
}
