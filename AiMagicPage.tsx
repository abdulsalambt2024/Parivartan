import React, { useState } from 'react';
import { marked } from 'marked';
import { analyzeImage, generateImage, generatePosterContent, enhanceImage, editImage } from '../services/geminiService';
import { SparklesIcon, AnnouncementIcon, ImageIcon, SearchIcon, EditIcon } from './Icons';

type AiTool = 'poster-gen' | 'image-enhance' | 'image-gen' | 'image-inspect' | 'image-edit';

const AiMagicPage = () => {
    const [activeTool, setActiveTool] = useState<AiTool | null>(null);

    const tools: { id: AiTool; label: string; description: string; icon: React.FC<{className?: string}> }[] = [
        { id: 'poster-gen', label: 'Poster Content Generator', description: 'Generate structured text for event posters.', icon: AnnouncementIcon },
        { id: 'image-enhance', label: 'Image Enhancer', description: 'Improve sharpness, lighting, and colors.', icon: SparklesIcon },
        { id: 'image-gen', label: 'Image Generator', description: 'Create a new image from a text prompt.', icon: ImageIcon },
        { id: 'image-inspect', label: 'Image Inspector', description: 'Get a detailed description of an image.', icon: SearchIcon },
        { id: 'image-edit', label: 'AI Image Editor', description: 'Modify an image using text commands.', icon: EditIcon },
    ];
    
    const renderActiveTool = () => {
        switch(activeTool) {
            case 'poster-gen': return <PosterContentGenerator />;
            case 'image-enhance': return <ImageEnhancer />;
            case 'image-gen': return <ImageGenerator />;
            case 'image-inspect': return <ImageInspector />;
            case 'image-edit': return <ImageEditor />;
            default: return null;
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center space-x-4 mb-8">
                <SparklesIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-dark dark:text-light">AI Magic Tools</h1>
                 {activeTool && (
                    <button onClick={() => setActiveTool(null)} className="text-sm font-semibold text-primary hover:underline">&larr; Back to all tools</button>
                 )}
            </div>
            
            {!activeTool ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map(tool => (
                        <button key={tool.id} onClick={() => setActiveTool(tool.id)} className="text-left p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all transform dark:border dark:border-gray-700">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-dark dark:text-light mb-2">{tool.label}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{tool.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg dark:border dark:border-gray-700">
                    {renderActiveTool()}
                </div>
            )}
        </div>
    );
};

const PosterContentGenerator = () => {
    const [details, setDetails] = useState({ title: '', date: '', points: '' });
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!details.title || !details.date || !details.points) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const generatedContent = await generatePosterContent(details);
            setResult(generatedContent);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (result) {
            // A simple way to convert markdown to plain text for clipboard
            const plainText = result.replace(/##\s/g, '').replace(/\*\*/g, '').replace(/-\s/g, '');
            navigator.clipboard.writeText(plainText)
                .then(() => alert('Content copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err));
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">Editable Poster Content Generator</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Describe your event, and the AI will generate structured text content that you can easily copy and paste into a design tool like Canva.</p>
            <div className="space-y-4">
                <input
                    type="text"
                    value={details.title}
                    onChange={(e) => setDetails(d => ({...d, title: e.target.value}))}
                    placeholder="Event or Topic Title (e.g., Annual Book Donation Drive)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                />
                <input
                    type="text"
                    value={details.date}
                    onChange={(e) => setDetails(d => ({...d, date: e.target.value}))}
                    placeholder="Date, Time, and Venue (e.g., October 28th, 10 AM, College Auditorium)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                />
                <textarea
                    value={details.points}
                    onChange={(e) => setDetails(d => ({...d, points: e.target.value}))}
                    placeholder="Key points or details (e.g., Collecting books for all ages, volunteers needed, special guest speaker)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary h-24 bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                />
            </div>
            <div className="text-right my-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {result && (
                <div>
                    <div className="prose prose-lg max-w-none p-4 bg-gray-50 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked(result) }} />
                    <button onClick={handleCopy} className="mt-4 bg-primary text-white font-semibold px-5 py-2 rounded-full hover:bg-opacity-90">
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

const ImageEnhancer = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEnhancedImage(null);
                setError('');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleEnhance = async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError('');
        setEnhancedImage(null);
        try {
            const result = await enhanceImage(originalImage);
            setEnhancedImage(result);
        } catch (err) {
            setError('Failed to enhance image. This can happen with complex images. Please try another one.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">AI Image Quality Enhancer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Upload an image to automatically improve its sharpness, lighting, and color vibrancy.</p>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-4 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {originalImage && (
                <div>
                    <div className="text-center mb-4">
                        <button onClick={handleEnhance} disabled={isLoading} className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50">
                            {isLoading ? 'Enhancing...' : '✨ Enhance Image'}
                        </button>
                    </div>
                     {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-center mb-2 dark:text-light">Original</h3>
                            <img src={originalImage} alt="Original" className="rounded-lg w-full shadow" />
                        </div>
                        <div>
                             <h3 className="font-semibold text-center mb-2 dark:text-light">Enhanced</h3>
                             <div className="rounded-lg w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center aspect-square shadow">
                                {isLoading ? (
                                    <div className="text-gray-500 dark:text-gray-400">Processing...</div>
                                ) : enhancedImage ? (
                                    <div>
                                        <img src={enhancedImage} alt="Enhanced" className="rounded-lg w-full" />
                                        <a href={enhancedImage} download={`enhanced-image-${Date.now()}.png`} className="block text-center mt-4 bg-primary text-white font-semibold px-5 py-2 rounded-full hover:bg-opacity-90">
                                            Download Enhanced Image
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4 text-center">Your enhanced image will appear here.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setImage(null);
        try {
            const generatedImage = await generateImage(prompt, aspectRatio);
            setImage(generatedImage);
        } catch (err) {
            setError('Failed to generate image. Please try a different prompt.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">Image Generator</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A vibrant painting of a student teaching a group of children under a large tree."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
            />
            <div className="flex items-center justify-between my-4 flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <label className="font-semibold dark:text-light">Aspect Ratio:</label>
                    {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                        <label key={ratio} className="flex items-center space-x-1 cursor-pointer">
                            <input
                                type="radio"
                                name="aspectRatio"
                                value={ratio}
                                checked={aspectRatio === ratio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="dark:text-light">{ratio}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {image && (
                <div className="text-center">
                    <img src={image} alt="Generated" className="rounded-lg max-w-full md:max-w-xl mx-auto shadow-md" />
                    <a href={image} download={`generated-image-${Date.now()}.png`} className="inline-block mt-4 bg-primary text-white font-semibold px-5 py-2 rounded-full hover:bg-opacity-90">
                        Download Image
                    </a>
                </div>
            )}
        </div>
    );
};

const ImageInspector = () => {
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysis('');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        setAnalysis('');
        try {
            const result = await analyzeImage(image, prompt);
            setAnalysis(result);
        } catch (err) {
            setAnalysis('Failed to analyze image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">Image Inspector</h2>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-4 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {image && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <img src={image} alt="Upload preview" className="rounded-lg w-full" />
                    </div>
                    <div>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mb-2 bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                        />
                        <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50">
                             {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                        {analysis && <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">{analysis}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const ImageEditor = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null);
                setError('');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt) return;
        setIsLoading(true);
        setError('');
        try {
            const result = await editImage(originalImage, prompt);
            setEditedImage(result);
        } catch (err) {
            setError('Failed to edit image. Please try another prompt or image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">AI Image Editor</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Upload an image and use a text prompt to modify it. Add objects, change styles, remove backgrounds, and more.</p>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-4 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {originalImage && (
                <div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <h3 className="font-semibold text-center mb-2 dark:text-light">Original</h3>
                            <img src={originalImage} alt="Original" className="rounded-lg w-full shadow" />
                        </div>
                        <div>
                             <h3 className="font-semibold text-center mb-2 dark:text-light">Edited</h3>
                             <div className="rounded-lg w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center aspect-square shadow">
                                {isLoading ? (
                                    <div className="text-gray-500 dark:text-gray-400">Processing...</div>
                                ) : editedImage ? (
                                    <div>
                                        <img src={editedImage} alt="Edited" className="rounded-lg w-full" />
                                        <a href={editedImage} download={`edited-image-${Date.now()}.png`} className="block text-center mt-4 bg-primary text-white font-semibold px-5 py-2 rounded-full hover:bg-opacity-90">
                                            Download Edited Image
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400 p-4 text-center">Your edited image will appear here.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Make it a watercolor painting, add a small dog in the corner..."
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                        />
                         <button onClick={handleGenerate} disabled={isLoading || !prompt} className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50">
                            {isLoading ? 'Generating...' : '✨ Generate Edit'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            )}
        </div>
    )
};


export default AiMagicPage;