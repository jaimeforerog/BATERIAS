import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { Equipo } from '@/types/equipo';
import equiposData from '@/data/equipos.json';
import { Search } from 'lucide-react';

interface EquipoSearchProps {
  onSelect: (equipo: Equipo) => void;
  error?: string;
}

export function EquipoSearch({ onSelect, error }: EquipoSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const equipos = equiposData as Equipo[];

  const filteredEquipos = useMemo(() => {
    if (!searchTerm) return [];

    const term = searchTerm.toLowerCase();
    return equipos.filter(
      (equipo) =>
        equipo.id.toString().includes(term) ||
        equipo.placa.toLowerCase().includes(term) ||
        equipo.descripcion.toLowerCase().includes(term)
    );
  }, [searchTerm, equipos]);

  const handleSelect = (equipo: Equipo) => {
    setSearchTerm(`${equipo.id} - ${equipo.placa} - ${equipo.descripcion}`);
    setShowResults(false);
    onSelect(equipo);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="equipo-search">
        Buscar Equipo <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          id="equipo-search"
          type="text"
          placeholder="Busca por ID, placa o descripción..."
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

      {showResults && filteredEquipos.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <div className="p-2">
            {filteredEquipos.map((equipo) => (
              <button
                key={equipo.id}
                type="button"
                onClick={() => handleSelect(equipo)}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                <div className="font-medium text-sm">
                  ID: {equipo.id} - {equipo.placa}
                </div>
                <div className="text-xs text-slate-600">{equipo.descripcion}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchTerm && filteredEquipos.length === 0 && (
        <Card className="absolute z-10 w-full mt-1 shadow-lg">
          <div className="p-4 text-sm text-slate-600 text-center">
            No se encontraron equipos
          </div>
        </Card>
      )}
    </div>
  );
}
