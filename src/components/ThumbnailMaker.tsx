import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";
import { CategorySelect } from "./CategorySelect";
import { Send, Loader2, Download, Bot, User, Image, SkipForward, Palette, Tag, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, type ThumbnailGenerationRequest } from "@/services/api";

interface ThumbnailData {
  bgImg: Array<{ file: File; description: string }>;
  majorImg: Array<{ file: File; description: string }>;
  imgIcons: Array<{ file: File; description: string }>;
  themeColor: string;
  category: string;
  finalDescription: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  type: 'text' | 'options' | 'image-upload' | 'inputs' | 'confirmation' | 'final-input' | 'result';
  data?: any;
}

type ChatStep = 'intro' | 'ask-images' | 'collect-images' | 'collect-inputs' | 'confirmation' | 'final-description' | 'generating' | 'result';

export const ThumbnailMaker = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>('ask-images');
  const [userInput, setUserInput] = useState('');
  const [data, setData] = useState<ThumbnailData>({
    bgImg: [],
    majorImg: [],
    imgIcons: [],
    themeColor: '',
    category: '',
    finalDescription: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [wantsImages, setWantsImages] = useState<boolean | null>(null);
  const [showFollowUpInput, setShowFollowUpInput] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start with welcome message immediately
    addBotMessage("Hi! I'm your AI assistant ready to create stunning YouTube thumbnails.", 'text');
    setTimeout(() => {
      addBotMessage("Would you like to add custom images to your thumbnail?", 'options', {
        options: [
          { id: 'add-image', label: 'Add Images', icon: Image, color: 'from-blue-600 to-blue-700' },
          { id: 'skip-image', label: 'Skip Images', icon: SkipForward, color: 'from-gray-600 to-gray-700' }
        ]
      });
    }, 1000);
  }, []);

  const addBotMessage = (content: string, type: ChatMessage['type'] = 'text', data?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender: 'bot',
      content,
      timestamp: new Date(),
      type,
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string, type: ChatMessage['type'] = 'text', data?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender: 'user',
      content,
      timestamp: new Date(),
      type,
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateData = (key: keyof ThumbnailData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionClick = (optionId: string) => {
    setIsWaitingForInput(true);
    
    setTimeout(() => {
      switch (optionId) {
        case 'add-image':
          addUserMessage("I'll add custom images");
          setWantsImages(true);
          setTimeout(() => {
            addBotMessage("Perfect! Upload your images below. You can add background images, main subjects, or small icons to enhance your thumbnail.", 'image-upload');
            setCurrentStep('collect-images');
          }, 1000);
          break;
          
        case 'skip-image':
          addUserMessage("I'll skip adding images");
          setWantsImages(false);
          setTimeout(() => {
            addBotMessage("No problem! Let's set up your thumbnail style and category.", 'inputs');
            setCurrentStep('collect-inputs');
          }, 1000);
          break;
          
        case 'done-images':
          addUserMessage("Finished uploading images");
          setTimeout(() => {
            addBotMessage("Great! Now let's configure your thumbnail style.", 'inputs');
            setCurrentStep('collect-inputs');
          }, 1000);
          break;
          
        case 'done-inputs':
          if (!data.themeColor || !data.category) {
            addBotMessage("Please make sure to select both a theme color and category before continuing.", 'text');
          } else {
            addUserMessage("Completed the setup");
            setTimeout(() => {
              showConfirmation();
            }, 1000);
          }
          break;
          
        case 'confirm-details':
          addUserMessage("Yes, these details look correct");
          setTimeout(() => {
            addBotMessage("Excellent! Now describe your perfect thumbnail in the input below. Be specific about colors, text, emotions, and style you want.", 'text');
            setCurrentStep('final-description');
          }, 1000);
          break;
          
        case 'edit-details':
          addUserMessage("I need to edit the details");
          setTimeout(() => {
            addBotMessage("No problem! Please update your preferences below.", 'inputs');
            setCurrentStep('collect-inputs');
          }, 1000);
          break;
      }
      setIsWaitingForInput(false);
    }, 1000);
  };

  const handleTextSubmit = () => {
    if (!userInput.trim() || userInput.length < 10) {
      addBotMessage("Please provide a more detailed description (at least 10 characters). The more specific you are, the better your thumbnail will be!", 'text');
      return;
    }
    
    updateData('finalDescription', userInput);
    addUserMessage(userInput);
    setUserInput('');
    generateThumbnail(userInput);
  };

  const handleFollowUpSubmit = async () => {
    if (!userInput.trim() || userInput.length < 5) {
      addBotMessage("Please provide a description for the changes you want (at least 5 characters).", 'text');
      return;
    }
    
    if (!generatedImageUrl) {
      addBotMessage("No image found to modify. Please generate a thumbnail first.", 'text');
      return;
    }
    
    addUserMessage(userInput);
    const followUpText = userInput;
    setUserInput('');
    setShowFollowUpInput(false);
    setIsGenerating(true);
    
    addBotMessage("🎨 Enhancing your thumbnail based on your feedback... This might take a few moments!", 'text');
    
    try {
      const result = await apiService.followUp(followUpText, generatedImageUrl);
      
      if (result.success && result.url) {
        setGeneratedImageUrl(result.url);
        addBotMessage(
          "✨ Your enhanced thumbnail is ready! Here's the updated version:",
          'result',
          { imageUrl: result.url }
        );
        toast({
          title: "Thumbnail Enhanced!",
          description: "Your thumbnail has been updated successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to enhance thumbnail");
      }
    } catch (error: any) {
      addBotMessage(
        `❌ Sorry, there was an error enhancing your thumbnail: ${error.message}. Would you like to try again?`
      );
      toast({
        title: "Enhancement Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions for persistent input
  const isInputEnabled = () => {
    return currentStep === 'final-description' || (currentStep === 'result' && showFollowUpInput);
  };

  const getInputPlaceholder = () => {
    if (currentStep === 'final-description') {
      return "Describe your perfect thumbnail...";
    } else if (currentStep === 'result' && showFollowUpInput) {
      return "Describe the changes you want to make...";
    } else {
      return "Input will be enabled when needed...";
    }
  };

  const canSubmit = () => {
    if (!isInputEnabled() || isGenerating || isWaitingForInput) return false;
    
    if (currentStep === 'final-description') {
      return userInput.length >= 10;
    } else if (currentStep === 'result' && showFollowUpInput) {
      return userInput.length >= 5;
    }
    return false;
  };

  const getButtonIcon = () => {
    if (currentStep === 'final-description') {
      return <Send className="h-5 w-5" />;
    } else if (currentStep === 'result' && showFollowUpInput) {
      return <Sparkles className="h-5 w-5" />;
    } else {
      return <Send className="h-5 w-5" />;
    }
  };

  const handleInputSubmit = () => {
    if (currentStep === 'final-description') {
      handleTextSubmit();
    } else if (currentStep === 'result' && showFollowUpInput) {
      handleFollowUpSubmit();
    }
  };

  const showConfirmation = () => {
    const summary = [];
    
    if (wantsImages) {
      if (data.bgImg.length > 0) summary.push(`🖼️ Background: ${data.bgImg[0].file.name}`);
      if (data.majorImg.length > 0) summary.push(`🎯 Main image: ${data.majorImg[0].file.name}`);
      if (data.imgIcons.length > 0) summary.push(`🎨 Icons: ${data.imgIcons.length} file(s)`);
    } else {
      summary.push("📝 No custom images");
    }
    
    summary.push(`🎨 Theme: ${data.themeColor}`);
    summary.push(`📂 Category: ${data.category}`);
    
    const confirmationText = `Here's your thumbnail setup:

${summary.join('\n')}

Does everything look good?`;
    
    addBotMessage(confirmationText, 'options', {
      options: [
        { id: 'confirm-details', label: 'Looks Perfect!', icon: Sparkles, color: 'from-gray-700 to-gray-800' },
        { id: 'edit-details', label: 'Edit Details', icon: FileText, color: 'from-orange-500 to-orange-600' }
      ]
    });
    setCurrentStep('confirmation');
  };

  const generateThumbnail = async (description: string) => {
    setCurrentStep('generating');
    setIsGenerating(true);
    
    addBotMessage("🎨 Creating your amazing thumbnail... This might take a few moments while I work my magic!", 'text');
    
    try {
      const request: ThumbnailGenerationRequest = {
        finalDescription: description,
        themeColor: data.themeColor,
        category: data.category,
      };

      if (data.bgImg.length > 0) {
        request.bgImg = data.bgImg[0].file;
        request.bgImgDescription = data.bgImg[0].description;
      }

      if (data.majorImg.length > 0) {
        request.majorImg = data.majorImg[0].file;
        request.majorImgDescription = data.majorImg[0].description;
      }

      if (data.imgIcons.length > 0) {
        request.imgIcons = data.imgIcons.map(icon => icon.file);
        request.imgDescriptions = data.imgIcons.map(icon => icon.description);
      }

      const result = await apiService.generateThumbnail(request);

      if (result.success && result.url) {
        setGeneratedImageUrl(result.url);
        addBotMessage(
          "🎉 Your thumbnail is ready! Here's what I created for you:",
          'result',
          { imageUrl: result.url }
        );
        setCurrentStep('result');
        toast({
          title: "Thumbnail Generated!",
          description: "Your thumbnail has been created successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to generate thumbnail");
      }
    } catch (error: any) {
      addBotMessage(
        `❌ Sorry, there was an error generating your thumbnail: ${error.message}. Would you like to try again?`
      );
      setCurrentStep('final-description');
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
  
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete!",
        description: "Your thumbnail has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startOver = () => {
    setMessages([]);
    setCurrentStep('ask-images');
    setData({
      bgImg: [],
      majorImg: [],
      imgIcons: [],
      themeColor: '',
      category: '',
      finalDescription: ''
    });
    setGeneratedImageUrl(null);
    setWantsImages(null);
    setShowFollowUpInput(false);
    setTimeout(() => {
      addBotMessage("✨ Ready to create another masterpiece! Let's start fresh.");
      setTimeout(() => {
        addBotMessage("Would you like to add custom images to your new thumbnail?", 'options', {
          options: [
            { id: 'add-image', label: 'Add Images', icon: Image, color: 'from-blue-600 to-blue-700' },
            { id: 'skip-image', label: 'Skip Images', icon: SkipForward, color: 'from-gray-600 to-gray-700' }
          ]
        });
      }, 1000);
    }, 500);
  };

  const renderMessage = (message: ChatMessage) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6 w-full`}>
        <div className={`${isBot ? 'w-full max-w-none' : 'w-fit max-w-[90%] sm:max-w-[80%]'} ${isBot ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-end gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
              isBot 
                ? 'bg-gray-600' 
                : 'bg-blue-500'
            }`} style={{animationDelay: `${Math.random() * 2}s`}}>
              {isBot ? <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            
            {/* Message bubble */}
            <div className={`px-3 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-sm ${
              isBot 
                ? 'bg-gray-800 border border-gray-700 text-gray-100' 
                : 'bg-blue-600 text-white border border-blue-600'
            } ${
              isBot ? 'rounded-bl-md' : 'rounded-br-md'
            } flex-1 relative hover:shadow-md transition-all duration-300`}>
              
              {/* Message content */}
              <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Option buttons */}
              {message.type === 'options' && message.data?.options && (
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                  {message.data.options.map((option: any) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        className={`w-full justify-start text-left bg-gradient-to-r ${option.color} hover:shadow-sm transition-all duration-300 transform hover:scale-105 border-0 text-xs sm:text-sm py-2 sm:py-3`}
                        disabled={isWaitingForInput}
                      >
                        <IconComponent className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              )}
              
              {/* Image upload interface */}
              {message.type === 'image-upload' && (
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                    <ImageUpload
                      name="bgImg"
                      label="🌅 Background Image (Optional)"
                      maxCount={1}
                      optional={true}
                      onImagesChange={(images) => updateData('bgImg', images)}
                    />
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                    <ImageUpload
                      name="majorImg"
                      label="🎯 Main Subject (Optional)"
                      maxCount={1}
                      optional={true}
                      onImagesChange={(images) => updateData('majorImg', images)}
                    />
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                    <ImageUpload
                      name="imgIcons"
                      label="🎨 Icons or Logos (Optional)"
                      maxCount={5}
                      optional={true}
                      requireDescription={true}
                      onImagesChange={(images) => updateData('imgIcons', images)}
                    />
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Button
                      onClick={() => handleOptionClick('done-images')}
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-sm transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm py-2 sm:py-3"
                      disabled={isWaitingForInput}
                    >
                      <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Continue to Style Setup
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Input fields */}
              {message.type === 'inputs' && (
                <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                  <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                    <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-200 flex items-center">
                      <Palette className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Theme Color *
                    </Label>
                    <ColorPicker
                      onColorChange={(color) => updateData('themeColor', color)}
                      selectedColor={data.themeColor}
                    />
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                    <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-gray-200 flex items-center">
                      <Tag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Content Category *
                    </Label>
                    <CategorySelect
                      onCategoryChange={(category) => updateData('category', category)}
                      selectedCategory={data.category}
                    />
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Button
                      onClick={() => handleOptionClick('done-inputs')}
                      className="w-full bg-gray-500 hover:from-gray-700 hover:to-gray-800 text-white shadow-sm transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm py-2 sm:py-3"
                      disabled={isWaitingForInput || !data.themeColor || !data.category}
                    >
                      <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Review My Setup
                    </Button>
                  </div>
                </div>
              )}
              
              
              {/* Result display */}
              {message.type === 'result' && message.data?.imageUrl && (
                <div className="mt-4 sm:mt-6">
                  <div className="bg-gray-800/50 rounded-xl p-3 sm:p-6 border border-gray-600/30">
                    <div className="relative group cursor-pointer" onClick={() => setEnlargedImage(message.data.imageUrl)}>
                      <img
                        src={message.data.imageUrl}
                        alt="Generated Thumbnail"
                        className="w-full h-auto rounded-xl border-2 border-gray-600 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] sm:max-h-[400px]"
                        style={{maxHeight: '250px', objectFit: 'contain'}}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 rounded-full px-2 py-1 sm:px-3 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to enlarge
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <Button 
                        onClick={handleDownload} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <Download className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Download HD
                      </Button>
                      <Button 
                        onClick={() => setShowFollowUpInput(!showFollowUpInput)} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        {showFollowUpInput ? 'Hide Input' : 'Modify Image'}
                      </Button>
                      <Button 
                        onClick={startOver} 
                        className="flex-1 bg-gray-500 hover:from-gray-700 hover:to-gray-800 text-white shadow-sm transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <FileText className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Create New
                      </Button>
                    </div>
                    {showFollowUpInput && (
                      <div className="mt-3 sm:mt-4 text-center text-xs text-gray-300">
                        💡 Use the input below to describe changes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-gray-900 relative overflow-hidden fixed inset-0">
      {/* Mini heading at top-left */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <h1 className="text-xs sm:text-sm font-medium text-gray-300">Thumbnail AI</h1>
      </div>

      {/* Chat Interface */}
      <div className="flex flex-col h-full pt-8 sm:pt-12">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-900 p-3 sm:p-6 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 w-full">
              {messages.map(renderMessage)}
              
              {isWaitingForInput && (
                <div className="flex justify-start mb-6">
                  <div className="flex items-end gap-2 sm:gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-600 flex items-center justify-center text-white shadow-sm">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-3 sm:px-6 sm:py-4 rounded-2xl rounded-bl-md shadow-sm flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-400" />
                        <span>Processing your request...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Simple Input at Bottom */}
          <div className="flex-shrink-0 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 sm:gap-4">
                <Input
                  placeholder={getInputPlaceholder()}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && isInputEnabled()) {
                      e.preventDefault();
                      handleInputSubmit();
                    }
                  }}
                  className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/30 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
                  disabled={!isInputEnabled()}
                />
                <Button
                  onClick={handleInputSubmit}
                  disabled={!canSubmit()}
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed px-3 sm:px-4 py-2 sm:py-3"
                >
                  {getButtonIcon()}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[90vh] sm:max-w-[90vw] sm:max-h-[85vh] flex items-center justify-center">
            <img
              src={enlargedImage}
              alt="Enlarged Thumbnail"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-colors duration-200 text-sm sm:text-base"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};