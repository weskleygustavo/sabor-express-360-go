
import React, { useEffect, useRef } from 'react';
import { Expense } from '../../types';

interface PrintableFinanceReportProps {
    data: Expense[];
    restaurantName: string;
    onClose: () => void;
}

const PrintableFinanceReport: React.FC<PrintableFinanceReportProps> = ({ data, restaurantName, onClose }) => {
    const printWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        const totalAmount = data.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPaid = data.filter(e => e.payment_date).reduce((sum, exp) => sum + exp.amount, 0);
        const totalPending = totalAmount - totalPaid;

        const reportHtml = `
            <html>
                <head>
                    <title>Financeiro - ${restaurantName}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #333; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
                        .restaurant-name { font-size: 24px; font-weight: 900; color: #111; margin: 0; }
                        .report-title { font-size: 16px; color: #666; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #f9fafb; color: #4b5563; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; text-align: left; }
                        td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
                        .text-right { text-align: right; }
                        .status { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; }
                        .paid { background: #dcfce7; color: #166534; }
                        .pending { background: #fef9c3; color: #854d0e; }
                        .overdue { background: #fee2e2; color: #991b1b; }
                        .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
                        .summary { margin-top: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                        .summary-card { background: #f9fafb; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; }
                        .summary-card h4 { margin: 0; font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
                        .summary-card p { margin: 5px 0 0 0; font-size: 18px; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <p class="restaurant-name">${restaurantName}</p>
                        <p class="report-title">Relatório de Contas a Pagar</p>
                    </div>

                    <div class="summary">
                        <div class="summary-card">
                            <h4>Total Lançado</h4>
                            <p>${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Total Pago</h4>
                            <p style="color: #059669">${totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Total Pendente</h4>
                            <p style="color: #dc2626">${totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Vencimento</th>
                                <th>Categoria / Descrição</th>
                                <th>Status</th>
                                <th class="text-right">Valor</th>
                                <th>Pagamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(exp => {
                                const isPaid = !!exp.payment_date;
                                const isOverdue = !isPaid && exp.due_date < new Date().toISOString().split('T')[0];
                                const statusClass = isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending');
                                const statusLabel = isPaid ? 'PAGO' : (isOverdue ? 'ATRASADO' : 'PENDENTE');
                                
                                return `
                                    <tr>
                                        <td>${new Date(exp.due_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</td>
                                        <td><strong>${exp.category?.name || '---'}</strong></td>
                                        <td><span class="status ${statusClass}">${statusLabel}</span></td>
                                        <td class="text-right"><strong>${exp.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                                        <td>${exp.payment_date ? new Date(exp.payment_date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '---'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        Documento gerado em ${new Date().toLocaleString('pt-BR')} - Sabor Express 360
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

export default PrintableFinanceReport;
