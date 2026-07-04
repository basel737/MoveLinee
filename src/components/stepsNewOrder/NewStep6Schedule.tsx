import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const NewStep6Schedule: React.FC = () => {
  const { order, setScheduledDate, setScheduledTime, nextStep, prevStep } = useNewOrder();

  const canContinue = order.scheduledDate && order.scheduledTime;

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Schedule Your Move</h1>
        <p className="text-muted-foreground">Select your preferred date and time</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Date Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Select Date
          </h3>
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={order.scheduledDate || undefined}
              onSelect={(date) => date && setScheduledDate(date)}
              disabled={disabledDays}
              className="rounded-md border"
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Select Time
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setScheduledTime(time)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                  order.scheduledTime === time
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-foreground"
                )}
              >
                {time}
              </button>
            ))}
          </div>
          
          {order.scheduledDate && order.scheduledTime && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Selected Schedule</p>
              <p className="font-semibold text-foreground">
                {order.scheduledDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {order.scheduledTime}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-3 max-w-md mx-auto mt-8">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1" disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};
