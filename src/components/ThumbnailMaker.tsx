import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChatBubble } from "./ChatBubble";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";
import { CategorySelect } from "./CategorySelect";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const updateData = (key: keyof ThumbnailData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = () => {
    if (currentStep === 2) {
      if (!data.themeColor || !data.category) {
        toast({
          title: "Missing required fields",
          description: "Please select both theme color and category",
          variant: "destructive"
        });
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!data.finalDescription.trim()) {
        toast({
          title: "Missing description",
          description: "Final description is required",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if imgIcons have descriptions
      if (data.imgIcons.length > 0) {
        const missingDescriptions = data.imgIcons.some(img => !img.description.trim());
        if (missingDescriptions) {
          toast({
            title: "Missing icon descriptions",
            description: "All image icons must have descriptions",
            variant: "destructive"
          });
          return false;
        }
      }
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

  const handleSubmit = () => {
    if (validateStep()) {
      toast({
        title: "Thumbnail data ready!",
        description: "Your thumbnail configuration has been completed successfully.",
      });
      console.log("Final thumbnail data:", data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <ChatBubble sender="bot">
              <p className="text-sm">Let's create your YouTube thumbnail! First, let's add some images. All images are optional, but you can add descriptions to make them more impactful.</p>
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
                className="bg-gradient-primary text-chat-bubble-foreground hover:shadow-glow"
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
                className="bg-chat-bubble-secondary border-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!data.themeColor || !data.category}
                className="bg-gradient-primary text-chat-bubble-foreground hover:shadow-glow disabled:opacity-50"
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
            </ChatBubble>

            <Card className="p-6 bg-chat-bubble-secondary border-border">
              <div className="space-y-4">
                <Label className="text-foreground font-medium">Final Description *</Label>
                <Textarea
                  placeholder="Describe your thumbnail's main message, tone, and purpose..."
                  value={data.finalDescription}
                  onChange={(e) => updateData('finalDescription', e.target.value)}
                  className="bg-background/50 border-border resize-none min-h-[120px]"
                  rows={5}
                />
              </div>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="bg-chat-bubble-secondary border-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!data.finalDescription.trim()}
                className="bg-gradient-primary text-chat-bubble-foreground hover:shadow-glow disabled:opacity-50"
              >
                Complete <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              YouTube Thumbnail Maker
            </h1>
            <p className="text-muted-foreground">Create amazing thumbnails with our chat-guided experience</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${currentStep >= step 
                      ? 'bg-gradient-primary text-chat-bubble-foreground shadow-glow' 
                      : 'bg-chat-bubble-secondary text-muted-foreground border border-border'
                    }
                  `}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`
                      w-8 h-1 mx-2 rounded transition-all duration-300
                      ${currentStep > step ? 'bg-primary' : 'bg-border'}
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