import React from 'react';
import { Camera, Loader2, Package, Check } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/PhotoUpload';

export const NewStep4Photos: React.FC = () => {
  const { order, addPhoto, removePhoto, analyzePhotos, nextStep, prevStep } = useNewOrder();

  const hasAnalyzedItems = order.analyzedItems.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Photo Upload & AI Analysis</h1>
        <p className="text-muted-foreground">Upload photos of your items for accurate estimation</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="bg-accent/50 rounded-xl p-4 flex items-start gap-3">
            <Camera className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Tips for better estimates:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Take photos of all items to be moved</li>
                <li>Include large furniture and appliances</li>
                <li>Show items that need disassembly/assembly</li>
              </ul>
            </div>
          </div>

          {/* Photo Upload */}
          <PhotoUpload
            photos={order.photos}
            onAddPhoto={addPhoto}
            onRemovePhoto={removePhoto}
          />
          
          {/* Analyze Button */}
          {order.photos.length > 0 && !hasAnalyzedItems && (
            <Button 
              onClick={analyzePhotos} 
              disabled={order.isAnalyzing} 
              className="w-full"
              size="lg"
            >
              {order.isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Analyze Photos with AI
                </>
              )}
            </Button>
          )}
          
          {/* Analysis Results */}
          {hasAnalyzedItems && (
            <div className="bg-accent rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                AI Analysis Results
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {order.analyzedItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-lg p-3 border border-border"
                  >
                    <p className="font-medium text-sm">{item.label}</p>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      {item.is_fragile && (
                        <span className="text-amber-500">⚠️ Fragile</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-primary font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Analysis complete! These items will be included in your order.
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3">Photo Analysis</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Upload photos of items to move</p>
              <p>• AI will identify and count items</p>
              <p>• Fragile items are marked automatically</p>
              <p>• Photos are optional but recommended</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              Back
            </Button>
            <Button onClick={nextStep} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
