import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChatBubble } from "./ChatBubble";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";
import { CategorySelect } from "./CategorySelect";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2, Download } from "lucide-react";
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

export const ThumbnailMaker = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const { toast } = useToast();

  const updateData = (key: keyof ThumbnailData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = () => {
    const errors: string[] = [];
    
    if (currentStep === 1) {
      // Validate image files if provided
      const allImages = [...data.bgImg, ...data.majorImg, ...data.imgIcons];
      
      for (const img of allImages) {
        if (img.file) {
          // Check file size (max 4MB)
          if (img.file.size > 4 * 1024 * 1024) {
            errors.push(`File "${img.file.name}" is too large (max 4MB)`);
          }
          
          // Check file type
          if (!img.file.type.startsWith('image/')) {
            errors.push(`File "${img.file.name}" is not a valid image`);
          }
        }
      }
      
      // Check if imgIcons have descriptions when provided
      if (data.imgIcons.length > 0) {
        const missingDescriptions = data.imgIcons.some(img => img.file && !img.description.trim());
        if (missingDescriptions) {
          errors.push("All image icons must have descriptions");
        }
      }
    }
    
    if (currentStep === 2) {
      if (!data.themeColor) {
        errors.push("Theme color is required");
      }
      if (!data.category) {
        errors.push("Category selection is required");
      }
    }
    
    if (currentStep === 3) {
      if (!data.finalDescription.trim()) {
        errors.push("Final description is required");
      } else if (data.finalDescription.trim().length < 10) {
        errors.push("Description must be at least 10 characters long");
      } else if (data.finalDescription.trim().length > 500) {
        errors.push("Description must be less than 500 characters");
      }
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsGenerating(true);
    
    try {
      // Prepare the request data
      const request: ThumbnailGenerationRequest = {
        finalDescription: data.finalDescription,
        themeColor: data.themeColor,
        category: data.category,
      };

      // Add optional files and descriptions
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

      // Generate the thumbnail
      const result = await apiService.generateThumbnail(request);

      if (result.success && result.url) {
        setGeneratedImageUrl(result.url);
        toast({
          title: "Thumbnail Generated Successfully!",
          description: result.message || "Your thumbnail has been created. Check the result below!",
        });
        setCurrentStep(4); // Move to results step
      } else {
        throw new Error(result.error || "Failed to generate thumbnail");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <ChatBubble sender="bot">
              <p className="text-sm">Let's create your YouTube thumbnail! First, let's add some images. All images are optional, but you can add descriptions to make them more impactful.</p>
              <div className="mt-4 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <div className="flex items-center gap-3 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Max file size: 4MB • Supported formats: JPG, PNG, GIF, WebP</span>
                </div>
              </div>
            </ChatBubble>

            <div className="space-y-6">
              <ImageUpload
                name="bgImg"
                label="Background Image"
                maxCount={1}
                optional={true}
                onImagesChange={(images) => updateData('bgImg', images)}
              />

              <ImageUpload
                name="majorImg"
                label="Major Image"
                maxCount={1}
                optional={true}
                onImagesChange={(images) => updateData('majorImg', images)}
              />

              <ImageUpload
                name="imgIcons"
                label="Image Icons"
                maxCount={5}
                optional={true}
                requireDescription={true}
                onImagesChange={(images) => updateData('imgIcons', images)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={nextStep}
                className="btn-primary"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <ChatBubble sender="bot">
              <p className="text-sm">Great! Now let's choose your theme color and category. Both are required to create the perfect thumbnail style.</p>
              <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3 text-sm font-medium text-primary">
                  <CheckCircle className="h-5 w-5" />
                  <span>These settings will help generate the perfect aesthetic for your content</span>
                </div>
              </div>
            </ChatBubble>

            <div className="space-y-6">
              <ColorPicker
                onColorChange={(color) => updateData('themeColor', color)}
                selectedColor={data.themeColor}
              />

              <CategorySelect
                onCategoryChange={(category) => updateData('category', category)}
                selectedCategory={data.category}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="btn-secondary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!data.themeColor || !data.category}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <ChatBubble sender="bot">
              <p className="text-sm">Perfect! Now add a final description for your thumbnail. This is required and will help define the overall message of your thumbnail.</p>
              <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                <div className="flex items-center gap-3 text-sm font-medium text-accent">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Description must be 10-500 characters • Be specific about the message and tone</span>
                </div>
              </div>
            </ChatBubble>

            <Card className="card-enhanced">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Final Description *</Label>
                  <span className="text-xs text-muted-foreground">
                    {data.finalDescription.length}/500
                  </span>
                </div>
                <Textarea
                  placeholder="Describe your thumbnail's main message, tone, and purpose..."
                  value={data.finalDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      updateData('finalDescription', e.target.value);
                    }
                  }}
                  className={`input-enhanced resize-none min-h-[120px] ${
                    data.finalDescription.length > 0 && data.finalDescription.length < 10
                      ? 'border-destructive focus:border-destructive'
                      : data.finalDescription.length >= 10
                      ? 'border-primary/50'
                      : ''
                  }`}
                  rows={5}
                />
                {data.finalDescription.length > 0 && data.finalDescription.length < 10 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Description too short (minimum 10 characters)
                  </p>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="btn-secondary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!data.finalDescription.trim() || data.finalDescription.length < 10 || isGenerating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Thumbnail <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <ChatBubble sender="bot">
              <p className="text-sm">🎉 Your thumbnail has been generated successfully! Here's your result:</p>
            </ChatBubble>

            {generatedImageUrl && (
              <Card className="card-enhanced">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-block group">
                      <img
                        src={generatedImageUrl}
                        alt="Generated Thumbnail"
                        className="max-w-full h-auto rounded-lg border-2 border-primary/20 mx-auto transition-opacity group-hover:opacity-90"
                        style={{ maxHeight: '400px' }}
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = generatedImageUrl;
                          link.download = `thumbnail-${Date.now()}.png`;
                          link.click();
                        }}
                      >
                        <div className="bg-white/90 rounded-full p-3 transform hover:scale-110 transition-transform">
                          <Download className="h-6 w-6 text-gray-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImageUrl;
                        link.download = `thumbnail-${Date.now()}.png`;
                        link.click();
                      }}
                      className="btn-primary"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Thumbnail
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(1);
                        setGeneratedImageUrl(null);
                        setData({
                          bgImg: [],
                          majorImg: [],
                          imgIcons: [],
                          themeColor: '',
                          category: '',
                          finalDescription: ''
                        });
                      }}
                      className="btn-secondary"
                    >
                      Create Another
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-accent rounded-full opacity-10 blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary animate-pulse-glow rounded-md bg-clip-text text-black text-transparent mb-2 animate-gradient">
              YouTube Thumbnail Maker
            </h1>
            <p className="text-muted-foreground text-lg">Create amazing thumbnails with our chat-guided experience</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    progress-step
                    ${currentStep > step 
                      ? 'completed' 
                      : currentStep === step
                      ? 'active animate-pulse-glow'
                      : 'pending'
                    }
                  `}>
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`
                      w-12 progress-connector
                      ${currentStep > step ? 'completed' : 'pending'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="animate-slide-up">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};