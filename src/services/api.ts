export interface ThumbnailGenerationRequest {
  finalDescription: string;
  themeColor: string;
  category: string;
  bgImg?: File;
  majorImg?: File;
  imgIcons?: File[];
  bgImgDescription?: string;
  majorImgDescription?: string;
  imgDescriptions?: string[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  url?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
  }

  async generateThumbnail(request: ThumbnailGenerationRequest): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('finalDescription', request.finalDescription);
      formData.append('themeColor', request.themeColor);
      formData.append('category', request.category);
      
      // Add optional text fields
      if (request.bgImgDescription) {
        formData.append('bgImgDescription', request.bgImgDescription);
      }
      if (request.majorImgDescription) {
        formData.append('majorImgDescription', request.majorImgDescription);
      }
      if (request.imgDescriptions && request.imgDescriptions.length > 0) {
        formData.append('imgDescriptions', JSON.stringify(request.imgDescriptions));
      }
      
      // Add optional file fields
      if (request.bgImg) {
        formData.append('bgImg', request.bgImg);
      }
      if (request.majorImg) {
        formData.append('majorImg', request.majorImg);
      }
      if (request.imgIcons && request.imgIcons.length > 0) {
        request.imgIcons.forEach((icon) => {
          formData.append('imgIcons', icon);
        });
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        url: result.url,
        message: result.message
      };

    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const apiService = new ApiService();