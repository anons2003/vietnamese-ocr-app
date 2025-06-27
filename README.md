# 🇻🇳 Vietnamese OCR Web Application

A modern, client-side OCR (Optical Character Recognition) web application with Vietnamese language support and advanced features.

![OCR App Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tesseract.js](https://img.shields.io/badge/Tesseract.js-6.0-orange)

## ✨ Features

### 🇻🇳 Vietnamese-First Experience
- **Default Vietnamese Language**: Pre-configured for Vietnamese text recognition
- **15 Language Support**: Vietnamese, English, Chinese (Simplified & Traditional), Japanese, Korean, Thai, Arabic, Hindi, and more
- **Optimized for Vietnamese**: Best OCR accuracy for Vietnamese documents and text

### 📱 Modern User Interface
- **Horizontal Layout**: Image preview on the left, extracted text on the right for better data visibility
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching
- **Real-time Editing**: Edit extracted text directly in the interface

### 📋 Multiple Input Methods
- **📁 File Upload**: Click to select or drag & drop images
- **📋 Paste from Clipboard**: Ctrl+V (Cmd+V) to paste images directly
- **🖼️ Screenshot Support**: Take a screenshot and paste it immediately
- **🌐 Web Image Copy**: Copy images from websites and paste

### 🎓 Educational PSM Modes
- **📄 PSM 3**: Fully automatic page segmentation (default) - Best for documents
- **📝 PSM 6**: Uniform block of text - Perfect for clean paragraphs
- **📏 PSM 7**: Single text line - Ideal for headlines and captions
- **🔤 PSM 8**: Single word - For logos and single words
- **📋 PSM 13**: Raw line treatment - Simple text lines
- **Interactive Help**: Detailed explanations and use cases for each mode

### 🚀 Advanced Features
- **🔄 Batch Processing**: Process multiple images simultaneously
- **📊 Progress Tracking**: Real-time progress bars and status updates
- **🔄 Retry Mechanism**: Automatic retry on processing failures
- **📝 Text Validation**: Smart text extraction with error handling
- **📋 Copy & Download**: Copy to clipboard or download as text files
- **🔔 Toast Notifications**: User-friendly success/error messages

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern UI
- **OCR Engine**: Tesseract.js (client-side processing)
- **Icons**: Lucide React
- **File Handling**: React Dropzone

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vietnamese-ocr-app.git
cd vietnamese-ocr-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic Usage
1. **Open the application** - Vietnamese is pre-selected as the default language
2. **Upload an image** using one of these methods:
   - Drag & drop an image file
   - Click "Upload Images" to select files
   - Copy an image and press Ctrl+V (Cmd+V)
   - Click "Paste from Clipboard" button
3. **Click "Process"** to extract text
4. **View and edit** the extracted text in the right panel
5. **Copy or download** the results

### Advanced Settings
1. **Click the Settings (⚙️) button**
2. **Choose language**: Select from 15 supported languages
3. **Select PSM Mode**: Click the help (❓) button to learn about different modes
4. **Process images** with optimized settings

### PSM Mode Selection Guide
- **Documents with mixed content** → Use PSM 3 (default)
- **Clean text paragraphs** → Use PSM 6
- **Single lines of text** → Use PSM 7
- **Single words or logos** → Use PSM 8
- **Simple text lines** → Use PSM 13

## 🌍 Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| 🇻🇳 Vietnamese | vie | 🇬🇧 English | eng |
| 🇪🇸 Spanish | spa | 🇫🇷 French | fra |
| 🇩🇪 German | deu | 🇮🇹 Italian | ita |
| 🇵🇹 Portuguese | por | 🇷🇺 Russian | rus |
| 🇨🇳 Chinese (Simplified) | chi_sim | 🇹🇼 Chinese (Traditional) | chi_tra |
| 🇯🇵 Japanese | jpn | 🇰🇷 Korean | kor |
| 🇹🇭 Thai | tha | 🇸🇦 Arabic | ara |
| 🇮🇳 Hindi | hin | | |

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── metadata.ts          # SEO metadata
├── components/
│   ├── ImageToTextConverter.tsx  # Main OCR component
│   ├── NoSSR.tsx                # Client-side rendering wrapper
│   └── __tests__/               # Component tests
└── ...
```

## 🔧 Configuration

### Environment Variables
No environment variables required - the app runs entirely client-side!

### Customization
- **Languages**: Modify `SUPPORTED_LANGUAGES` in `ImageToTextConverter.tsx`
- **PSM Modes**: Update `PSM_OPTIONS` for different segmentation modes
- **File Limits**: Adjust `MAX_FILE_SIZE` and `ACCEPTED_FORMATS`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) for the amazing OCR engine
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Lucide](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you have any questions or need help, please:
- 🐛 [Open an issue](https://github.com/yourusername/vietnamese-ocr-app/issues)
- 💬 [Start a discussion](https://github.com/yourusername/vietnamese-ocr-app/discussions)
- 📧 Email: your.email@example.com

---

**Made with ❤️ for the Vietnamese developer community**
