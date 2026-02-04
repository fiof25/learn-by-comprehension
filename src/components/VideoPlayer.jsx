import React from 'react';
import { ArrowLeft, Play, SkipBack, SkipForward } from 'lucide-react';

const VideoPlayer = ({ onComplete }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4">
        <button className="flex items-center text-[10px] font-bold text-gray-400 hover:text-gray-800 mb-2 transition-colors group uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to student list
        </button>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">Watch and discuss the contents of this video</h1>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">Press continue when you are finished watching this lecture</p>
      </div>

      {/* Video Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pb-4 min-h-0">
        <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 min-h-0">
           {/* Video Title Bar */}
           <div className="bg-[#1e40af] px-6 py-3 text-white">
             <h2 className="text-base font-bold">A Brief History of Chess</h2>
             <p className="text-[10px] opacity-70 font-medium">Source: Youtube</p>
           </div>
           
           {/* Video Content Container */}
           <div className="p-4 flex-1 flex flex-col min-h-0">
             {/* YouTube Embed */}
             <div className="aspect-video relative bg-black rounded-lg overflow-hidden border border-gray-100 shadow-sm flex-shrink">
               <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/YeB-1F-UKO0" 
                  title="A Brief History of Chess"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
               ></iframe>
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-8 py-4 flex justify-end items-center border-t border-gray-50 bg-white">
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

export default VideoPlayer;
