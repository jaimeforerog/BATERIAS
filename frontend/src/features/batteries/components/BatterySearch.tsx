import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useBatteries } from '../hooks/useBatteries';
import { BatteryStatus } from '@/api/types/enums';
import type { Battery } from '@/types/battery'; // Ensure this type exists or use any

interface BatterySearchProps {
  onSelect: (battery: Battery) => void;
  error?: string;
}

export function BatterySearch({ onSelect, error }: BatterySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Fetch only NEW batteries
  const { data: batteries = [] } = useBatteries(BatteryStatus.New);

  const filteredBatteries = useMemo(() => {
    if (!searchTerm) return batteries;

    const term = searchTerm.toLowerCase();
    return batteries.filter(
      (battery: any) =>
        battery.serialNumber.toLowerCase().includes(term) ||
        battery.model.toLowerCase().includes(term)
    );
  }, [searchTerm, batteries]);

  const handleSelect = (battery: any) => {
    setSearchTerm(`${battery.serialNumber} - ${battery.model}`);
    setShowResults(false);
    onSelect(battery);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="battery-search">
        Buscar Batería Registrada <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          id="battery-search"
          type="text"
          placeholder="Busca por Serie o Modelo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10"
          aria-invalid={!!error}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showResults && filteredBatteries.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg bg-white">
          <div className="p-2">
            {filteredBatteries.map((battery: any) => (
              <button
                key={battery.id}
                type="button"
                onClick={() => handleSelect(battery)}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                <div className="font-medium text-sm">
                  Serie: {battery.serialNumber}
                </div>
                <div className="text-xs text-slate-600">Modelo: {battery.model}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchTerm && filteredBatteries.length === 0 && (
        <Card className="absolute z-10 w-full mt-1 shadow-lg bg-white">
          <div className="p-4 text-sm text-slate-600 text-center">
            No se encontraron baterías con ese criterio
          </div>
        </Card>
      )}
    </div>
  );
}
