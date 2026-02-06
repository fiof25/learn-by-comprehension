import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ReadingViewer = ({ onComplete, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Read and discuss the contents of this reading</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">Press continue when you are finished reading</p>
      </div>

      {/* PDF centered */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-8 py-4">
        <iframe
          src="/assets/Drought_Reading.pdf"
          title="Drought Reading"
          className="w-full max-w-[700px] h-full rounded-lg border border-gray-100 bg-gray-50"
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="px-8 py-3 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to questions
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-[#16a34a] text-white text-sm font-bold rounded-lg hover:bg-[#15803d] transition-all flex items-center shadow-sm"
        >
          Continue
          <span className="ml-2 text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingViewer;
