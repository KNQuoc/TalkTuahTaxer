import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Slider } from "./components/ui/slider";

const MoneySlider = () => {
  const [amount, setAmount] = useState(0);

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center text-4xl font-bold text-green-600">
            ${amount}
          </div>

          <Slider
            defaultValue={[0]}
            max={500}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />

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
