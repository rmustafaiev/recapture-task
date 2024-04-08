import { Table } from 'console-table-printer';
import { CartReport, OrderReport } from '../report/report.entity.js';

export const cartTable = (cart: CartReport): Table => {
  const t = new Table();

  cart.topProductsAbandoned
    .map((item: { name: any; product_id: any; qty: any }, i: number) => {
      return {
        AbandonedCartRate: i === 0 ? cart.abandonedCartRate + '%' : '',
        TopProductsAbandoned: `${item.name} #${item.product_id}, qty: ${item.qty}`,
      };
    })
    .forEach((row) => t.addRow(row));

  return t;
};

export const orderTable = (order: OrderReport): Table => {
  const orderViewTable = new Table();
  const purchased = order.topProductsPurchased.map((item) => {
    return `${item.name} #${item.product_id}, qty: ${item.qty}`;
  });

  order.salesPerDay.forEach((item, i) => {
    const row = {
      SalesPerDay: `${item.date}, $ ${item.total}`,
      TopProductsPurchased: i < purchased.length ? purchased[i] : '',
      OrderAverage: i < 1 ? `$ ${order.orderAverage}` : '',
    };
    orderViewTable.addRow(row);
  });

  return orderViewTable;
};
