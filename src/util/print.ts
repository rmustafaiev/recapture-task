import { Table} from 'console-table-printer';
import {CartReport, OrderReport} from "../report/report.entity.js";
import {Collector} from "../report/report.collector.js";
import {Calculator, CartCalculator, OrderCalculator} from "../report/report.calculator.js";

export const cartTable = (cart: CartReport): Table => {
    const t = new Table();

    cart.topProductsAbandoned.map((item: { name: any; product_id: any; qty: any; }, i: number) => {
        return {
            AbandonedCartRate: i === 0 ? cart.abandonedCartRate + '%' : "",
            TopProductsAbandoned: `${item.name} #${item.product_id}, qty: ${item.qty}`
        }
    }).forEach(row => t.addRow(row));

    return t;
}

export const orderTable = (order: OrderReport): Table => {
    const orderViewTable = new Table();
    const purchased = order
        .topProductsPurchased.map((item) => {
            return `${item.name} #${item.product_id}, qty: ${item.qty}`
        })

    order.salesPerDay.forEach((item, i) => {
        const row = {
            SalesPerDay: `${item.date}, $ ${item.total}`,
            TopProductsPurchased: i < purchased.length ? purchased[i] : '',
            OrderAverage: i < 1 ? `$ ${order.orderAverage}` : ''
        }
        orderViewTable.addRow(row);
    })

    return orderViewTable
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// @ts-ignore
export const throttle = (func, delay) => {
    let lastCall = 0;
    // @ts-ignore
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        func(...args);
    };
}

const progressPrint = (reports:[]) => {
    console.clear();
    console.log('Loading Reports...');
}

const resultPrint = (reports:[]) => {
    const reportTables = reports
        .map((report:any) => report.orderAverage && orderTable(report) || cartTable(report))

    console.clear();
    console.log('=======================================================================\n')
    reportTables.forEach(table => {
        console.log('\n')
        table.printTable();
    })
}
export const debouncedPrintReport = (collectors:Array<Collector>) => {
    const throttledPrint = throttle(progressPrint, 333);
    const calculators = collectors.map(c => c.calculator);
    // @ts-ignore
    collectors.forEach(collector => {
        collector.on("progress", () => throttledPrint(calculators.map(c => c?.result())));
        // @ts-ignore
        collector.on("completed", () => resultPrint(calculators.map(c => c?.result())));
    })
    // @ts-ignore
    // collectors.forEach(collector=> {
    //     // @ts-ignore
    //     collector.on("complete", () => resultPrint(calculators.map(c => c?.result())));
    // })
}
