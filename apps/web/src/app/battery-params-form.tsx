"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BatteryParams } from "../services/api"

interface BatteryParamsFormProps {
  defaultParams: BatteryParams;
  onChange: (params: BatteryParams) => void;
}

export function BatteryParamsForm({ defaultParams, onChange }: BatteryParamsFormProps) {
  const [params, setParams] = useState<BatteryParams>(defaultParams);

  const handleParamChange = (key: keyof BatteryParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onChange(newParams);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battery Parameters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="capacity">Capacity (MW)</Label>
          <Input
            id="capacity"
            type="number"
            value={params.capacity_mw}
            onChange={handleParamChange("capacity_mw")}
            min={0}
            step={0.1}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (Hours)</Label>
          <Input
            id="duration"
            type="number"
            value={params.duration_hours}
            onChange={handleParamChange("duration_hours")}
            min={0}
            step={0.5}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="efficiency">Efficiency (%)</Label>
          <Input
            id="efficiency"
            type="number"
            value={params.efficiency * 100}
            onChange={(e) => handleParamChange("efficiency")(new Event('change') as any)}
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="min-soc">Min State of Charge (%)</Label>
            <Input
              id="min-soc"
              type="number"
              value={params.min_soc * 100}
              onChange={(e) => handleParamChange("min_soc")(new Event('change') as any)}
              min={0}
              max={100}
              step={5}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-soc">Max State of Charge (%)</Label>
            <Input
              id="max-soc"
              type="number"
              value={params.max_soc * 100}
              onChange={(e) => handleParamChange("max_soc")(new Event('change') as any)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 