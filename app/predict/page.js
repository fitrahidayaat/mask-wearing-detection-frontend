'use client';

import { useState } from 'react';
import exampleImg from './example.jpg';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Upload, Eye, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import axios from 'axios';

const detectMaskWearing = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(
      process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000/predict', // Fallback URL
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      prediction: response.data.prediction,
      threshold: response.data.threshold,
    };
  } catch (error) {
    console.error('Error detecting mask wearing:', error);
    return {
      prediction: 'Error',
      threshold: '0',
      error: error.response?.data?.error || 'An unknown error occurred.',
    };
  }
};

export default function MaskWearingDetectionPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(URL.createObjectURL(file));
        setError(null);
        setPredictionResult(null);
      } else {
        setError('Please select a valid image file.');
        setSelectedImage(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please select an image before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageFile = await fetch(selectedImage)
        .then((res) => res.blob())
        .then((blob) => new File([blob], "image.jpg", { type: "image/jpeg" }));

      const result = await detectMaskWearing(imageFile);
      console.log(result); // Log result for debugging

      if (result.prediction === 'Error') {
        throw new Error(result.error || 'Detection failed.');
      }

      setPredictionResult({
        prediction: result.prediction,
        threshold: result.threshold,
        base64Image: `data:image/jpeg;base64,${result.prediction}`, // Prefix with correct data URL format
      });

      setSelectedImage(URL.createObjectURL(imageFile)); // Keep the selected image after prediction
    } catch (err) {
      setError(err.message || 'An error occurred during detection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPrediction = () => {
    setSelectedImage(null);
    setPredictionResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl sm:text-4xl font-bold">Mask Wearing Detection</CardTitle>
            <CardDescription className="text-lg mt-2">Upload an image to assess mask-wearing compliance with our AI-powered detection tool.</CardDescription>
          </CardHeader>
          <CardContent>
            {!predictionResult?.base64Image ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Example Image Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Example Image</h3>
                  <div className="relative">
                    <Image 
                      src={exampleImg} 
                      alt="Example of mask-wearing detection" 
                      width={500} 
                      height={375} 
                      className="rounded-lg shadow-md"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-full cursor-help shadow-sm">
                            <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Image source: Public domain</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This image shows a clear view of people wearing protective face masks in a public area.
                  </p>
                </div>

                {/* Upload Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Upload Your Image</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Eye className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                    {selectedImage && (
                      <div className="mt-4 flex justify-center">
                        <Image src={selectedImage} alt="Selected mask-wearing image" width={400} height={300} className="rounded-lg shadow-md" />
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting || !selectedImage}>
                      {isSubmitting ? 'Analyzing...' : 'Detect Mask Wearing'}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Prediction Result Section */}
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full flex items-center justify-center">
                    <Image src={predictionResult.base64Image} alt="Analyzed mask-wearing image" width={416} height={416} className="rounded-lg shadow-md" />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-center">
                  <Button onClick={resetPrediction} className="w-full max-w-md">
                    <RefreshCw className="mr-2 h-4 w-4" /> Analyze Another Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
