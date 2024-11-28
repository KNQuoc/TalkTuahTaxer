import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Slider } from "./components/ui/slider";

const MoneySlider = () => {
  const [amount, setAmount] = useState(0);

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };

  // Calculate dynamic height for the slider track
  const getTrackHeight = () => {
    const minHeight = 4; // Starting height in pixels
    const maxHeight = 50; // Maximum height in pixels
    const height = minHeight + (amount / 500) * (maxHeight - minHeight);
    return `${height}px`;
  };

  return (
    <Card className="w-[400px] h-[250px] flex flex-col">
      <CardHeader>
        <CardTitle>Select Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center text-4xl font-bold text-green-600">
            ${amount}
          </div>

          <style>{`
            .dynamic-slider [data-orientation="horizontal"] {
              height: ${getTrackHeight()} !important;
              transition: height 0.3s ease;
            }
            
            .dynamic-slider [role="slider"] {
              height: ${parseInt(getTrackHeight()) + 8}px !important;
              width: ${parseInt(getTrackHeight()) + 8}px !important;
              transition: all 0.3s ease;
            }
          `}</style>

          <div className="dynamic-slider">
            <Slider
              defaultValue={[0]}
              max={500}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>$0</span>
            <span>$500</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoneySlider;
