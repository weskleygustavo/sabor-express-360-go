
import React, { useEffect, useRef } from 'react';
import { OrderType } from '../../types';

interface AnalyticsData {
    totalRevenue: number;
    operatingProfit: number;
    deliveredOrdersCount: number;
    averageTicket: number;
    canceledOrdersCount: number;
    financialLoss: number;
    sortedProducts: { name: string; quantity: number; revenue: number; profit: number }[];
    sortedWaiters: { name: string; ordersCount: number; totalRevenue: number; totalCommission: number }[];
    period: string;
    filter: 'all' | OrderType.DELIVERY | OrderType.DINE_IN;
}

interface PrintableAnalyticsReportProps {
    data: AnalyticsData;
    restaurantName: string;
    onClose: () => void;
}

const PrintableAnalyticsReport: React.FC<PrintableAnalyticsReportProps> = ({ data, restaurantName, onClose }) => {
    const printWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        const filterTextMap = {
            'all': 'Total (Entrega + Consumo Local)',
            [OrderType.DELIVERY]: 'Apenas Entregas',
            [OrderType.DINE_IN]: 'Apenas Consumo Local'
        };

        const reportHtml = `
            <html>
                <head>
                    <title>Relatório de Análise - ${restaurantName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h1 { font-size: 22px; text-align: center; margin-bottom: 5px; }
                        h2 { font-size: 14px; text-align: center; margin-top: 0; font-weight: normal; color: #666; margin-bottom: 20px; }
                        .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                        .card { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
                        .card h3 { margin: 0; font-size: 12px; color: #777; text-transform: uppercase; }
                        .card p { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                        th, td { border: 1px solid #eee; padding: 6px; text-align: left; }
                        th { background-color: #f9f9f9; color: #555; }
                        .text-right { text-align: right; }
                        .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Relatório Financeiro e de Equipe</h1>
                    <h2>${restaurantName} | Período: ${data.period}</h2>
                    <p style="font-size: 12px; margin-bottom: 20px;"><strong>Filtro:</strong> ${filterTextMap[data.filter]}</p>
                    
                    <div class="grid">
                        <div class="card">
                            <h3>Receita Bruta</h3>
                            <p>${data.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div class="card">
                            <h3>Lucro Operacional</h3>
                            <p>${data.operatingProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div class="card">
                            <h3>Pedidos Concluídos</h3>
                            <p>${data.deliveredOrdersCount}</p>
                        </div>
                        <div class="card">
                            <h3>Ticket Médio</h3>
                            <p>${data.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>

                    <div class="section-title">Comissões de Garçons</div>
                    ${data.sortedWaiters.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome do Garçom</th>
                                    <th class="text-right">Pedidos</th>
                                    <th class="text-right">Volume de Vendas</th>
                                    <th class="text-right">Comissão Devida</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.sortedWaiters.map(w => `
                                    <tr>
                                        <td><strong>${w.name}</strong></td>
                                        <td class="text-right">${w.ordersCount}</td>
                                        <td class="text-right">${w.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td class="text-right"><strong>${w.totalCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                                    </tr>
                                `).join('')}
                                <tr style="background: #f0f0f0; font-weight: bold;">
                                    <td colspan="3">TOTAL DE COMISSÕES</td>
                                    <td class="text-right">${data.sortedWaiters.reduce((sum, w) => sum + w.totalCommission, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            </tbody>
                        </table>
                    ` : '<p style="font-size: 12px;">Nenhuma comissão registrada.</p>'}

                    <div class="section-title">Ranking de Produtos (Mais Lucrativos)</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th class="text-right">Qtd.</th>
                                <th class="text-right">Lucro Acumulado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.sortedProducts.slice(0, 15).map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td class="text-right">${p.quantity}</td>
                                    <td class="text-right">${p.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        Gerado em ${new Date().toLocaleString('pt-BR')} - Sabor Express 360
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindowRef.current = printWindow;
            printWindow.document.write(reportHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }

        const handleAfterPrint = () => {
            if (printWindowRef.current && !printWindowRef.current.closed) {
                printWindowRef.current.close();
            }
            onClose();
        };

        if (printWindow) {
            printWindow.onafterprint = handleAfterPrint;
        }

        return () => {
            if (printWindowRef.current && !printWindowRef.current.closed) {
                printWindowRef.current.close();
            }
        };
    }, [data, restaurantName, onClose]);

    return null; 
};

export default PrintableAnalyticsReport;
