import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Slider } from "./components/ui/slider";

const MoneySlider = () => {
  const [amount, setAmount] = useState(0);

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };

  const getTrackHeight = () => {
    const minHeight = 10;
    const maxHeight = 75;
    const height = minHeight + (amount / 500) * (maxHeight - minHeight);
    return `${height}px`;
  };

  const getHandleSize = () => {
    const minSize = 50;
    const maxSize = 125;
    const size = minSize + (amount / 500) * (maxSize - minSize);
    return `${size}px`;
  };

  const getHandleImage = () => {
    return amount >= 400 ? "/CaseOh.jpg" : "/ChillGuy.jpeg";
  };

  return (
    <Card className="w-[400px] h-[300px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Select Amount</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pb-8">
        <div className="space-y-8">
          <div className="text-center text-5xl font-bold text-green-600 pt-4">
            ${amount}
          </div>

          <style>{`
            .dynamic-slider [data-orientation="horizontal"] {
              height: ${getTrackHeight()} !important;
              transition: height 0.3s ease;
            }
            
            .dynamic-slider [role="slider"] {
              height: ${getHandleSize()} !important;
              width: ${getHandleSize()} !important;
              background: none !important;
              transition: all 0.3s ease;
            }

            .dynamic-slider [role="slider"]::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${getHandleSize()};
              height: ${getHandleSize()};
              background-image: url('${getHandleImage()}');
              background-size: cover;
              background-position: center;
              border-radius: 50%;
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
