import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { downloadAuditExcel, downloadAuditCSV } from '@/api/audit.api';
import type { AuditFilters } from '../types/audit.types';
import { toast } from 'sonner';

interface ExportButtonsProps {
  filters: AuditFilters;
}

export function ExportButtons({ filters }: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await downloadAuditExcel(filters);
      toast.success('Archivo Excel descargado exitosamente');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al exportar a Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      await downloadAuditCSV(filters);
      toast.success('Archivo CSV descargado exitosamente');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Error al exportar a CSV');
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportExcel}
        variant="outline"
        className="gap-2"
        disabled={isExportingExcel}
      >
        <FileSpreadsheet className={`h-4 w-4 ${isExportingExcel ? 'opacity-50' : ''}`} />
        {isExportingExcel ? 'Exportando...' : 'Excel'}
      </Button>
      <Button
        onClick={handleExportCSV}
        variant="outline"
        className="gap-2"
        disabled={isExportingCSV}
      >
        <Download className={`h-4 w-4 ${isExportingCSV ? 'opacity-50' : ''}`} />
        {isExportingCSV ? 'Exportando...' : 'CSV'}
      </Button>
    </div>
  );
}
