
import React, { useEffect, useRef } from 'react';

interface CashFlowDay {
    day: number;
    dateObj: Date;
    saldoAnterior: number;
    entradas: number;
    saidas: number;
    resultado: number;
    caixaFinal: number;
    fullDateStr: string;
}

interface PrintableCashFlowReportProps {
    data: CashFlowDay[];
    restaurantName: string;
    period: string;
    filter: string;
    onClose: () => void;
}

const PrintableCashFlowReport: React.FC<PrintableCashFlowReportProps> = ({ data, restaurantName, period, filter, onClose }) => {
    const printWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        // Cálculo consolidado para o resumo final
        const totalEntradas = data.reduce((sum, d) => sum + d.entradas, 0);
        const totalSaidas = data.reduce((sum, d) => sum + d.saidas, 0);
        const saldoPeriodo = totalEntradas - totalSaidas;

        const reportHtml = `
            <html>
                <head>
                    <title>Fluxo de Caixa - ${restaurantName}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #333; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
                        .restaurant-name { font-size: 24px; font-weight: 900; color: #111; margin: 0; }
                        .report-title { font-size: 16px; color: #666; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                        .meta-info { display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 15px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #f9fafb; color: #4b5563; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; text-align: left; }
                        td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
                        .text-right { text-align: right; }
                        .positive { color: #059669; font-weight: bold; }
                        .negative { color: #dc2626; font-weight: bold; }
                        .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
                        .summary { margin-top: 30px; display: flex; justify-content: flex-end; }
                        .summary-box { background: #f9fafb; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb; min-width: 250px; }
                        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; font-weight: bold; color: #666; }
                        .total-row { 
                            display: flex; 
                            justify-content: space-between; 
                            font-weight: 900; 
                            font-size: 18px; 
                            border-top: 2px solid #e5e7eb; 
                            margin-top: 15px; 
                            padding-top: 15px; 
                            color: ${saldoPeriodo >= 0 ? '#059669' : '#dc2626'};
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <p class="restaurant-name">${restaurantName}</p>
                        <p class="report-title">Extrato de Fluxo de Caixa</p>
                        <div class="meta-info">
                            <span>Período: ${period}</span>
                            <span>Filtro: ${filter}</span>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>Saldo Anterior</th>
                                <th class="text-right">Entradas (+)</th>
                                <th class="text-right">Saídas (-)</th>
                                <th class="text-right">Resultado</th>
                                <th class="text-right">Vlr. em Caixa</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(d => `
                                <tr>
                                    <td><strong>Dia ${String(d.day).padStart(2, '0')}</strong> (${d.dateObj.toLocaleDateString('pt-BR', {weekday: 'short'})})</td>
                                    <td>${d.saldoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td class="text-right positive">${d.entradas > 0 ? d.entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}</td>
                                    <td class="text-right negative">${d.saidas > 0 ? d.saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}</td>
                                    <td class="text-right ${d.resultado >= 0 ? 'positive' : 'negative'}">
                                        ${d.resultado !== 0 ? d.resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}
                                    </td>
                                    <td class="text-right"><strong>${d.caixaFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-box">
                            <div class="summary-row">
                                <span>TOTAL ENTRADAS:</span>
                                <span class="positive">${totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div class="summary-row">
                                <span>TOTAL SAÍDAS:</span>
                                <span class="negative">${totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div class="total-row">
                                <span>SALDO FINAL:</span>
                                <span>${saldoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <p style="font-size: 9px; color: #999; margin-top: 10px; text-align: right; font-style: italic;">
                                * O Saldo Final representa o lucro/prejuízo líquido do período selecionado.
                            </p>
                        </div>
                    </div>

                    <div class="footer">
                        Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')} - Sabor Express 360
                    </div>
                    <script>
                        window.onload = function() { 
                            window.print(); 
                            window.onafterprint = function() { window.close(); } 
                        };
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
    }, [data, restaurantName, period, filter, onClose]);

    return null;
};

export default PrintableCashFlowReport;
