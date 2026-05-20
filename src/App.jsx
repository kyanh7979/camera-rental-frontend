import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import FloatingAIButton from './components/ai/FloatingAIButton.jsx';
import AIChatModal from './components/ai/AIChatModal.jsx';

function App() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRouter />

        {/* AI Chat System */}
        <FloatingAIButton onClick={() => setAiModalOpen(true)} />
        <AIChatModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
