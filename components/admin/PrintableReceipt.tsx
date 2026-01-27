
import React, { useEffect, useRef } from 'react';
import { Order, User, OrderType } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface PrintableReceiptProps {
    order?: Order;
    tableOrders?: Order[];
    tableName?: string;
    customer?: User;
    serviceChargeOverride?: number;
    onClose: () => void;
}

// Função de escape para prevenir XSS Injection
const escapeHTML = (str: string | undefined | null): string => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ 
    order, 
    tableOrders, 
    tableName, 
    customer, 
    serviceChargeOverride,
    onClose 
}) => {
    const { restaurant } = useApp();
    const printWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        const items = order 
            ? order.items 
            : (tableOrders ? tableOrders.flatMap(o => o.items) : []);
        
        const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const deliveryFee = (order?.orderType === OrderType.DELIVERY) ? (restaurant?.deliveryFee || 0) : 0;
        
        const effectiveServiceRate = serviceChargeOverride !== undefined 
            ? serviceChargeOverride 
            : (restaurant?.serviceCharge || 0);

        const serviceChargeValue = tableOrders ? (subtotal * (effectiveServiceRate / 100)) : 0;
        const total = subtotal + deliveryFee + serviceChargeValue;

        const waiter = order?.waiterName || (tableOrders?.find(o => o.waiterName)?.waiterName) || 'Auto-atendimento';
        const restaurantName = restaurant?.name || 'Sabor Express';

        const receiptHtml = `
            <html>
                <head>
                    <title>Impressão - ${escapeHTML(restaurantName)}</title>
                    <style>
                        @page { margin: 0; }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            margin: 0; 
                            padding: 10px; 
                            font-size: 13px; 
                            line-height: 1.2;
                            color: #000;
                            width: 280px;
                        }
                        .header { text-align: center; margin-bottom: 10px; }
                        .restaurant-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .section-title { text-align: center; font-weight: bold; margin: 5px 0; border: 1px solid #000; padding: 2px; }
                        .info-row { display: flex; justify-content: space-between; margin: 2px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                        th { text-align: left; border-bottom: 1px dashed #000; padding-bottom: 4px; }
                        td { padding: 4px 0; vertical-align: top; }
                        .qty { width: 30px; }
                        .price { text-align: right; width: 80px; }
                        .totals { margin-top: 10px; }
                        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 4px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 11px; }
                        .order-id { font-size: 20px; font-weight: 900; }
                        .bold { font-weight: bold; }
                        .notes-box { border: 1px solid #000; padding: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="restaurant-name">${escapeHTML(restaurantName)}</div>
                        <div>${escapeHTML(restaurant?.address)}</div>
                        <div>Fone: ${escapeHTML(restaurant?.whatsapp)}</div>
                        <div class="divider"></div>
                        <div class="section-title">
                            ${tableOrders ? 'PRÉVIA DE CONTA' : 'CUPOM DE PEDIDO'}
                        </div>
                    </div>

                    <div class="info-row">
                        <span>Data: ${new Date().toLocaleDateString('pt-BR')}</span>
                        <span>Hora: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    ${order ? `
                        <div class="info-row"><span class="order-id">PEDIDO: #${escapeHTML(order.id.toString())}</span></div>
                        ${order.orderType === OrderType.DINE_IN ? `
                            <div class="info-row"><span class="bold" style="font-size: 16px;">MESA: ${escapeHTML(order.table?.name || 'Não informada')}</span></div>
                        ` : ''}
                    ` : `
                        <div class="info-row"><span class="bold" style="font-size: 16px;">MESA: ${escapeHTML(tableName)}</span></div>
                    `}
                    
                    <div class="info-row"><span>ATEND: ${escapeHTML(waiter)}</span></div>
                    
                    <div class="divider"></div>
                    
                    ${order?.orderType === OrderType.DELIVERY ? `
                        <div class="bold">CLIENTE: ${escapeHTML(customer?.name || 'Consumidor')}</div>
                        <div class="bold">CONTATO: ${escapeHTML(customer?.whatsapp || 'Não informado')}</div>
                        <div>END: ${escapeHTML(customer?.address?.street)}, ${escapeHTML(customer?.address?.number)}</div>
                        <div>REF: ${escapeHTML(customer?.address?.referencePoint || '-')}</div>
                        <div class="divider"></div>
                    ` : ''}

                    ${order?.notes ? `
                        <div class="notes-box">
                            <div class="bold">OBSERVAÇÕES:</div>
                            <div style="white-space: pre-wrap;">${escapeHTML(order.notes)}</div>
                        </div>
                        <div class="divider"></div>
                    ` : ''}

                    <table>
                        <thead>
                            <tr>
                                <th class="qty">QTD</th>
                                <th>DESCRIÇÃO</th>
                                <th class="price">VALOR</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td class="qty">${item.quantity}</td>
                                    <td>${escapeHTML(item.name)}</td>
                                    <td class="price">${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="divider"></div>

                    <div class="totals">
                        <div class="info-row"><span>SUBTOTAL:</span><span>${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        ${deliveryFee > 0 ? `<div class="info-row"><span>TAXA ENTREGA:</span><span>${deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>` : ''}
                        ${serviceChargeValue > 0 ? `<div class="info-row"><span>TAXA SERVIÇO (${effectiveServiceRate}%):</span><span>${serviceChargeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>` : ''}
                        <div class="total-row"><span>TOTAL:</span><span>${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    </div>

                    ${order?.orderType === OrderType.DELIVERY ? `
                        <div class="divider"></div>
                        <div class="info-row"><span>PAGAMENTO:</span><span>${escapeHTML(order.paymentMethod)}</span></div>
                        ${order.changeFor ? `
                            <div class="info-row"><span>TROCO PARA:</span><span>${order.changeFor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div class="info-row"><span>TROCO:</span><span>${(order.changeFor - order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        ` : ''}
                    ` : ''}

                    <div class="footer">
                        ${escapeHTML(restaurantName)}<br>
                        Obrigado pela preferência!
                    </div>
                    
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=350,height=600');
        if (printWindow) {
            printWindowRef.current = printWindow;
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
        }

        return () => {
            if (printWindowRef.current && !printWindowRef.current.closed) {
                printWindowRef.current.close();
            }
        };
    }, [order, tableOrders, tableName, customer, restaurant, serviceChargeOverride]);

    return null;
};

export default PrintableReceipt;
