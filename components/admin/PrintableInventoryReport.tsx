
import React, { useEffect, useRef } from 'react';

interface InventoryItem {
    id: string;
    name: string;
    stockCount: number;
    lastUnitCost: number;
    totalIn: number;
    totalSold: number;
    stockValue: number;
    isCritical: boolean;
}

interface PrintableInventoryReportProps {
    data: InventoryItem[];
    restaurantName: string;
    onClose: () => void;
}

const PrintableInventoryReport: React.FC<PrintableInventoryReportProps> = ({ data, restaurantName, onClose }) => {
    const printWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        const totalStockValue = data.reduce((sum, item) => sum + item.stockValue, 0);
        const criticalCount = data.filter(i => i.isCritical).length;

        const reportHtml = `
            <html>
                <head>
                    <title>Estoque - ${restaurantName}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #333; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
                        .restaurant-name { font-size: 24px; font-weight: 900; color: #111; margin: 0; }
                        .report-title { font-size: 16px; color: #666; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #f9fafb; color: #4b5563; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; text-align: left; }
                        td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .critical { background-color: #fff1f2; color: #e11d48; font-weight: bold; }
                        .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
                        .summary { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .summary-card { background: #f9fafb; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; }
                        .summary-card h4 { margin: 0; font-size: 9px; color: #999; text-transform: uppercase; }
                        .summary-card p { margin: 5px 0 0 0; font-size: 18px; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <p class="restaurant-name">${restaurantName}</p>
                        <p class="report-title">Relatório de Inventário de Estoque</p>
                    </div>

                    <div class="summary">
                        <div class="summary-card">
                            <h4>Valor Total em Estoque</h4>
                            <p>${totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Itens Críticos para Reposição</h4>
                            <p style="color: ${criticalCount > 0 ? '#e11d48' : '#059669'}">${criticalCount} produtos</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Produto (ID)</th>
                                <th class="text-center">Qtd Entr.</th>
                                <th class="text-center">Qtd Saída</th>
                                <th class="text-center">Em Estoque</th>
                                <th class="text-right">Custo Unit.</th>
                                <th class="text-right">Vlr. Estoque</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr class="${item.isCritical ? 'critical' : ''}">
                                    <td><strong>${item.name}</strong><br><span style="font-size: 8px; color: #999">${item.id.slice(0, 12)}</span></td>
                                    <td class="text-center">${item.totalIn}</td>
                                    <td class="text-center">${item.totalSold}</td>
                                    <td class="text-center"><strong>${item.stockCount}</strong></td>
                                    <td class="text-right">${item.lastUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td class="text-right"><strong>${item.stockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        Inventário gerado em ${new Date().toLocaleString('pt-BR')} - Sabor Express 360
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } };
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindowRef.current = printWindow;
            printWindow.document.write(reportHtml);
            printWindow.document.close();
        }

        return () => { if (printWindowRef.current) printWindowRef.current.close(); };
    }, [data, restaurantName, onClose]);

    return null;
};

export default PrintableInventoryReport;
