import apiClient from './client';

export const downloadBatteriesReport = async (): Promise<void> => {
    const response = await apiClient.get('/api/reports/batteries/excel', {
        responseType: 'blob',
    });

    // Create a blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from header or use default
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `baterias_reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2)
            fileName = fileNameMatch[1];
    }

    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
