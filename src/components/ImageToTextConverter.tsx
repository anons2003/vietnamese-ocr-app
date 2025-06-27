'use client';

import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import {
  Upload,
  FileText,
  Download,
  Copy,
  Trash2,
  Eye,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Clipboard,
  HelpCircle,
  Info
} from 'lucide-react';

interface ProcessedImage {
  id: string;
  file: File;
  preview: string;
  extractedText: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface OCRSettings {
  language: string;
  psm: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'vie', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'tha', name: 'Thai' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' }
];

const PSM_OPTIONS = [
  {
    value: 3,
    label: 'PSM 3: Fully automatic page segmentation (default)',
    description: 'Best for documents with mixed content like paragraphs, columns, and images. Automatically detects text blocks.',
    useCase: 'Documents, web pages, mixed layouts',
    icon: '📄'
  },
  {
    value: 6,
    label: 'PSM 6: Uniform block of text',
    description: 'Treats the image as a single uniform block of text. Good for clean, well-formatted text blocks.',
    useCase: 'Clean paragraphs, book pages, articles',
    icon: '📝'
  },
  {
    value: 7,
    label: 'PSM 7: Single text line',
    description: 'Treats the image as a single text line. Perfect for single lines of text like titles or captions.',
    useCase: 'Headlines, captions, single lines',
    icon: '📏'
  },
  {
    value: 8,
    label: 'PSM 8: Single word',
    description: 'Treats the image as a single word. Use when the image contains only one word.',
    useCase: 'Single words, logos with text, labels',
    icon: '🔤'
  },
  {
    value: 13,
    label: 'PSM 13: Raw line treatment',
    description: 'Treats the image as a single text line without additional processing. Good for simple, clean text lines.',
    useCase: 'Simple text lines, minimal processing needed',
    icon: '📋'
  }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
  'image/webp': ['.webp']
};

// Memoized image preview component for better performance
const ImagePreview = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    decoding="async"
    style={{ contentVisibility: 'auto' }}
  />
));

ImagePreview.displayName = 'ImagePreview';

// Utility function to validate image files
const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 10MB)` };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  // Check file type
  const validTypes = Object.keys(ACCEPTED_FORMATS);
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: `Unsupported format: ${file.type}` };
  }

  // Check file extension as additional validation
  const fileName = file.name.toLowerCase();
  const hasValidExtension = Object.values(ACCEPTED_FORMATS)
    .flat()
    .some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  return { isValid: true };
};

export default function ImageToTextConverter() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [settings, setSettings] = useState<OCRSettings>({
    language: 'vie',
    psm: 3
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPasting, setIsPasting] = useState(false);
  const [hasClipboardImage, setHasClipboardImage] = useState(false);
  const [showPSMHelp, setShowPSMHelp] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Toast notification system
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type };
    setToasts(prev => [...prev, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    setIsPasting(true);
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.read) {
        showToast('Clipboard API not supported in this browser', 'error');
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      const imageItems = clipboardItems.filter(item =>
        item.types.some(type => type.startsWith('image/'))
      );

      if (imageItems.length === 0) {
        showToast('No images found in clipboard', 'error');
        return;
      }

      for (const item of imageItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);

          // Create a File object from the blob
          const file = new File([blob], `pasted-image-${Date.now()}.${imageType.split('/')[1]}`, {
            type: imageType
          });

          // Validate the file
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            showToast(`Pasted image: ${validation.error}`, 'error');
            continue;
          }

          // Add to images
          const newImage: ProcessedImage = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            extractedText: '',
            status: 'pending',
            progress: 0
          };

          setImages(prev => [...prev, newImage]);
          showToast('Image pasted successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Paste error:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        showToast('Clipboard access denied. Please grant permission.', 'error');
      } else {
        showToast('Failed to paste image from clipboard', 'error');
      }
    } finally {
      setIsPasting(false);
    }
  }, [showToast]);

  // Check clipboard for images periodically
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.read) {
          const clipboardItems = await navigator.clipboard.read();
          const hasImage = clipboardItems.some(item =>
            item.types.some(type => type.startsWith('image/'))
          );
          setHasClipboardImage(hasImage);
        }
      } catch (error) {
        // Ignore errors - clipboard access might be denied
        setHasClipboardImage(false);
      }
    };

    // Check initially
    checkClipboard();

    // Check periodically when window is focused
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        checkClipboard();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle keyboard paste
  useEffect(() => {
    const handleKeyboardPaste = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Only handle paste if not focused on an input/textarea
        const activeElement = document.activeElement;
        if (activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true'
        )) {
          return;
        }

        e.preventDefault();
        await handlePaste();
      }
    };

    document.addEventListener('keydown', handleKeyboardPaste);
    return () => document.removeEventListener('keydown', handleKeyboardPaste);
  }, [handlePaste]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      images.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files with better error messages
    if (rejectedFiles.length > 0) {
      const errorMessages: string[] = [];
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            errorMessages.push(`${file.name}: File too large (max 10MB)`);
          } else if (error.code === 'file-invalid-type') {
            errorMessages.push(`${file.name}: Unsupported format`);
          } else {
            errorMessages.push(`${file.name}: ${error.message}`);
          }
        });
      });

      if (errorMessages.length > 0) {
        errorMessages.forEach(msg => showToast(msg, 'error'));
      }
    }

    // Validate and process accepted files
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showToast(`${file.name}: ${validation.error}`, 'error');
        return false;
      }
      return true;
    });

    const newImages: ProcessedImage[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      extractedText: '',
      status: 'pending',
      progress: 0
    }));

    setImages(prev => [...prev, ...newImages]);

    // Show success message for batch uploads
    if (validFiles.length > 1) {
      console.log(`Successfully added ${validFiles.length} images for processing`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDragEnter: () => {
      // Optional: Add visual feedback when dragging
    },
    onDragLeave: () => {
      // Optional: Remove visual feedback when leaving
    }
  });

  // Handle paste event on the upload area
  const handleUploadAreaPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length === 0) {
      showToast('No images found in clipboard', 'error');
      return;
    }

    imageItems.forEach(item => {
      const file = item.getAsFile();
      if (file) {
        // Validate the file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          showToast(`Pasted image: ${validation.error}`, 'error');
          return;
        }

        // Add to images
        const newImage: ProcessedImage = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          extractedText: '',
          status: 'pending',
          progress: 0
        };

        setImages(prev => [...prev, newImage]);
        showToast('Image pasted successfully!', 'success');
      }
    });
  }, [showToast]);

  const processImage = async (imageId: string, retryCount = 0) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, status: 'processing', progress: 0, error: undefined }
        : img
    ));

    try {
      // Validate image before processing
      const validation = validateImageFile(image.file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const result = await Tesseract.recognize(
        image.file,
        settings.language,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progress = Math.round(m.progress * 100);
              setImages(prev => prev.map(img =>
                img.id === imageId
                  ? { ...img, progress }
                  : img
              ));
            }
          },
          tessedit_pageseg_mode: settings.psm,
          // Add timeout to prevent hanging
          timeout: 60000 // 60 seconds
        }
      );

      const extractedText = result.data.text.trim();

      setImages(prev => prev.map(img =>
        img.id === imageId
          ? {
              ...img,
              status: 'completed',
              extractedText,
              progress: 100
            }
          : img
      ));

      if (extractedText) {
        showToast(`Text extracted from ${image.file.name}`, 'success');
      } else {
        showToast(`No text found in ${image.file.name}`, 'info');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Retry logic for network or temporary errors
      if (retryCount < 2 && (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('worker')
      )) {
        showToast(`Retrying ${image.file.name}... (${retryCount + 1}/3)`, 'info');
        setTimeout(() => processImage(imageId, retryCount + 1), 2000);
        return;
      }

      setImages(prev => prev.map(img =>
        img.id === imageId
          ? {
              ...img,
              status: 'error',
              error: errorMessage,
              progress: 0
            }
          : img
      ));

      showToast(`Failed to process ${image.file.name}: ${errorMessage}`, 'error');
    }
  };

  const processAllImages = async () => {
    setIsProcessingAll(true);
    const pendingImages = images.filter(img => img.status === 'pending');
    
    for (const image of pendingImages) {
      await processImage(image.id);
    }
    
    setIsProcessingAll(false);
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const clearAllImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Text copied to clipboard!', 'success');
    } catch (error) {
      try {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Text copied to clipboard!', 'success');
      } catch (fallbackError) {
        showToast('Failed to copy text to clipboard', 'error');
      }
    }
  };

  const downloadText = (text: string, filename: string) => {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}.txt`, 'success');
    } catch (error) {
      showToast('Failed to download file', 'error');
    }
  };

  const downloadAllText = () => {
    const allText = images
      .filter(img => img.status === 'completed')
      .map(img => `=== ${img.file.name} ===\n${img.extractedText}\n\n`)
      .join('');
    
    if (allText) {
      downloadText(allText, 'extracted-text-all');
    }
  };

  const getAllExtractedText = () => {
    return images
      .filter(img => img.status === 'completed')
      .map(img => img.extractedText)
      .join('\n\n');
  };

  // Memoize expensive calculations
  const { pendingCount, processingCount, completedCount, errorCount } = useMemo(() => {
    return images.reduce((acc, img) => {
      acc[`${img.status}Count`]++;
      return acc;
    }, {
      pendingCount: 0,
      processingCount: 0,
      completedCount: 0,
      errorCount: 0
    } as Record<string, number>);
  }, [images]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">OCR Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page Segmentation Mode
                </label>
                <button
                  onClick={() => setShowPSMHelp(!showPSMHelp)}
                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  title="Show PSM mode explanations"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <select
                value={settings.psm}
                onChange={(e) => setSettings(prev => ({ ...prev, psm: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {PSM_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>

              {/* Current PSM Description */}
              {(() => {
                const currentPSM = PSM_OPTIONS.find(opt => opt.value === settings.psm);
                return currentPSM ? (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{currentPSM.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {currentPSM.label}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          {currentPSM.description}
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                          <strong>Best for:</strong> {currentPSM.useCase}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* PSM Help Panel */}
              {showPSMHelp && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Page Segmentation Mode Guide
                    </h4>
                    <button
                      onClick={() => setShowPSMHelp(false)}
                      className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {PSM_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          settings.psm === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setSettings(prev => ({ ...prev, psm: option.value }))}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {option.label}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {option.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              <strong>Best for:</strong> {option.useCase}
                            </p>
                          </div>
                          {settings.psm === option.value && (
                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>💡 Tip:</strong> Start with PSM 3 (default) for most images. If results are poor, try PSM 6 for clean text blocks, PSM 7 for single lines, or PSM 8 for single words.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        onPaste={handleUploadAreaPaste}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        } bg-white dark:bg-gray-800`}
        tabIndex={0}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isDragActive ? 'Drop images here' : 'Upload Images'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop images here, or click to select files
        </p>

        {/* Paste Button */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
          disabled={isPasting}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 mb-4 ${
            hasClipboardImage
              ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPasting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Clipboard className={`w-4 h-4 ${hasClipboardImage ? 'animate-bounce' : ''}`} />
          )}
          <span>
            {isPasting
              ? 'Pasting...'
              : hasClipboardImage
                ? 'Paste Image Ready!'
                : 'Paste from Clipboard'
            }
          </span>
          {hasClipboardImage && !isPasting && (
            <span className="inline-flex h-2 w-2 rounded-full bg-green-300 animate-ping"></span>
          )}
        </button>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
          Supports: JPG, PNG, GIF, BMP, TIFF, WebP (Max 10MB each)
        </p>
        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
          <p>💡 <strong>Quick Tips:</strong></p>
          <p>• Copy an image and press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+V</kbd> (or <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Cmd+V</kbd>) to paste</p>
          <p>• Take a screenshot and paste it directly</p>
          <p>• Copy images from websites or documents</p>
        </div>
      </div>

      {/* Control Panel */}
      {images.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{images.length}</span> images uploaded
                {completedCount > 0 && (
                  <span className="ml-2">• <span className="font-medium text-green-600">{completedCount}</span> processed</span>
                )}
                {errorCount > 0 && (
                  <span className="ml-2">• <span className="font-medium text-red-600">{errorCount}</span> failed</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              {pendingCount > 0 && (
                <button
                  onClick={processAllImages}
                  disabled={isProcessingAll || processingCount > 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessingAll || processingCount > 0 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>
                    {isProcessingAll || processingCount > 0
                      ? 'Processing...'
                      : `Process ${pendingCount} Image${pendingCount !== 1 ? 's' : ''}`
                    }
                  </span>
                </button>
              )}

              {completedCount > 0 && (
                <>
                  <button
                    onClick={() => copyToClipboard(getAllExtractedText())}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy All</span>
                  </button>

                  <button
                    onClick={downloadAllText}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                </>
              )}

              <button
                onClick={clearAllImages}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Image Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      image.status === 'pending' ? 'bg-gray-400' :
                      image.status === 'processing' ? 'bg-blue-500' :
                      image.status === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`} />
                    <h3 className="font-medium text-gray-800 dark:text-white truncate">
                      {image.file.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {image.status === 'pending' && (
                      <button
                        onClick={() => processImage(image.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}

                    {image.status === 'completed' && (
                      <>
                        <button
                          onClick={() => copyToClipboard(image.extractedText)}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadText(image.extractedText, image.file.name.split('.')[0])}
                          className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {image.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Processing...</span>
                      <span>{image.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${image.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {image.status === 'error' && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700 dark:text-red-400">
                        {image.error || 'Processing failed'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content - Side by Side Layout */}
              <div className="flex flex-col lg:flex-row">
                {/* Image Preview - Left Side */}
                <div className="lg:w-1/2 p-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <ImagePreview
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Extracted Text - Right Side */}
                <div className="lg:w-1/2 p-4 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
                  {image.status === 'completed' && image.extractedText && (
                    <div className="h-full flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Extracted Text
                      </label>
                      <textarea
                        value={image.extractedText}
                        onChange={(e) => {
                          setImages(prev => prev.map(img =>
                            img.id === image.id
                              ? { ...img, extractedText: e.target.value }
                              : img
                          ));
                        }}
                        className="flex-1 min-h-[200px] lg:min-h-[300px] p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Extracted text will appear here..."
                      />
                    </div>
                  )}

                  {image.status === 'completed' && !image.extractedText && (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No text detected in this image</p>
                      </div>
                    </div>
                  )}

                  {image.status !== 'completed' && (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>
                          {image.status === 'pending' ? 'Ready to process' :
                           image.status === 'processing' ? 'Processing...' :
                           'Processing failed'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <FileText className="w-5 h-5" />}
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
