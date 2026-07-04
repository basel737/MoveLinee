import React from 'react';
import { User, Phone, Mail, MessageSquare } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const NewStep7CustomerInfo: React.FC = () => {
  const { order, setCustomerInfo, nextStep, prevStep } = useNewOrder();

  const updateField = (field: keyof typeof order.customerInfo, value: string) => {
    setCustomerInfo({
      ...order.customerInfo,
      [field]: value,
    });
  };

  const canContinue = order.customerInfo.fullName && order.customerInfo.phone;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Information</h1>
        <p className="text-muted-foreground">Please provide your contact details</p>
      </div>
      
      <div className="max-w-xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={order.customerInfo.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={order.customerInfo.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={order.customerInfo.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={order.customerInfo.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={prevStep} className="flex-1">
            Back
          </Button>
          <Button onClick={nextStep} className="flex-1" disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
