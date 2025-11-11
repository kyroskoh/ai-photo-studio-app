import React, { useState, useCallback, useRef } from 'react';
import { editImage, recognizeObjects } from './services/geminiService';
import { UploadIcon, SparklesIcon, LoadingSpinner, PhotoIcon, TagIcon } from './components/icons';

type ImageState = {
  file: File | null;
  url: string | null;
  mimeType: string;
};

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState>({ file: null, url: null, mimeType: '' });
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for object recognition
  const [tags, setTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState<boolean>(false);
  const [taggingError, setTaggingError] = useState<string | null>(null);

  const generateTags = useCallback(async (file: File) => {
    setIsTagging(true);
    setTaggingError(null);
    setTags([]);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            const newTags = await recognizeObjects(base64data, file.type);
            setTags(newTags);
        };
        reader.onerror = () => {
          throw new Error("Failed to read the image file for tagging.");
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during tagging.';
        setTaggingError(errorMessage);
        console.error(err);
    } finally {
        setIsTagging(false);
    }
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('Image size exceeds 4MB. Please upload a smaller image.');
        return;
      }
      
      setOriginalImage({
        file: file,
        url: URL.createObjectURL(file),
        mimeType: file.type
      });
      setEditedImageUrl(null);
      setError(null);
      setPrompt('');

      // Automatically generate tags for the new image
      generateTags(file);
    }
  }, [generateTags]);


  const handleGenerate = useCallback(async () => {
    if (!originalImage.file || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalImage.file);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const newBase64Image = await editImage(base64data, originalImage.mimeType, prompt);
        setEditedImageUrl(`data:image/png;base64,${newBase64Image}`);
      };
      reader.onerror = () => {
        throw new Error("Failed to read the image file.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage.file, originalImage.mimeType, prompt]);

  const examplePrompts = {
    "Quick Edits": [
      "Remove the background",
      "Make the background solid white",
      "Improve the lighting and colors",
      "Add a subtle shadow underneath",
    ],
    "Creative Backgrounds": [
      "Place this on a marble countertop",
      "Add a soft, blurry studio background",
      "Generate a background of a futuristic neon city",
      "Put it on a rustic wooden table",
    ],
    "Artistic Styles": [
      "Apply a minimalist watercolor style",
      "Give it a retro, vintage photograph look",
      "Transform it into a cyberpunk artwork",
      "Make it look like a Van Gogh painting",
    ]
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-500">
            AI Photo Studio
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Transform your product photos with simple text instructions.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel: Upload, Tags & Original Image */}
          <div className="flex flex-col gap-4">
             <div 
                className="relative border-2 border-dashed border-slate-600 rounded-xl flex flex-col justify-center items-center text-center p-6 h-80 cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  aria-label="Upload Image"
                />
                {originalImage.url ? (
                  <img src={originalImage.url} alt="Original" className="max-w-full max-h-full object-contain rounded-lg"/>
                ) : (
                  <>
                    <UploadIcon className="w-12 h-12 text-slate-500 mb-2" />
                    <span className="font-semibold text-slate-300">Click to upload an image</span>
                    <span className="text-sm text-slate-500 mt-1">PNG, JPG, or WEBP (Max 4MB)</span>
                  </>
                )}
              </div>
            
             {/* Auto-generated Tags Section */}
             {(isTagging || tags.length > 0 || taggingError) && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <TagIcon className="w-5 h-5" aria-hidden="true" />
                  <span>Auto-generated Tags</span>
                </h3>
                <div className="flex flex-wrap gap-2 min-h-[24px] items-center">
                  {isTagging && 
                    <div className="flex items-center gap-2 text-slate-400" role="status">
                        <LoadingSpinner className="w-4 h-4" /> 
                        <span>Analyzing image...</span>
                    </div>
                  }
                  {taggingError && <span className="text-red-400 text-sm" role="alert">{taggingError}</span>}
                  {tags.map(tag => (
                    <span key={tag} className="bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Prompt & Result */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="prompt" className="font-semibold text-slate-300">Your instruction:</label>
               <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Remove the background and add a soft shadow'"
                className="w-full h-28 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                disabled={!originalImage.file}
                aria-describedby="prompt-examples"
              />
               <div id="prompt-examples" className="mt-2 space-y-3">
                 {Object.entries(examplePrompts).map(([category, prompts]) => (
                   <div key={category}>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {prompts.map(p => (
                          <button 
                            key={p} 
                            onClick={() => setPrompt(p)} 
                            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={!originalImage.file}>
                            {p}
                          </button>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !originalImage.file || !prompt}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
              <span>{isLoading ? 'Generating...' : 'Generate'}</span>
            </button>

            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg" role="alert">{error}</p>}
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-80 flex justify-center items-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-400" role="status">
                  <LoadingSpinner className="w-8 h-8"/>
                  <span>AI is working its magic...</span>
                </div>
              ) : editedImageUrl ? (
                 <a href={editedImageUrl} download="edited-image.png" title="Click to download">
                    <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-lg cursor-pointer"/>
                </a>
              ) : (
                 <div className="flex flex-col items-center gap-2 text-slate-500">
                  <PhotoIcon className="w-12 h-12" />
                  <span>Your edited image will appear here</span>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Gemini 2.5 Flash Image</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
