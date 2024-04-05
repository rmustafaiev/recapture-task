import {Cart, CartReport, Order, OrderReport, Product, SalesPerDay} from "./report.entity.js";

export const TOP_FIFE = 5;

export interface Calculator {
    processNext(data: object | any): void;
    result(): object;
}

export class Calculator implements Calculator {
    protected topProducts: Map<string, number> = new Map();
    protected topProductsNames: Map<string, string> = new Map();

    protected addProductCounter = (products: Array<Product>) => {
        products.forEach((product: Product) => {
            const exCount = this.topProducts.get(product.product_id);
            if (exCount) {
                this.topProducts.set(product.product_id, exCount + product.qty);
            } else {
                this.topProducts.set(product.product_id, 1);
                this.topProductsNames.set(product.product_id, product.name);
            }
        })
    };
    getTopProducts(): Array<Product> {
        const products = Array
            .from(this.topProducts.entries())
            .sort((a, b) => b[1] - a[1]);

        return products.slice(0, TOP_FIFE).map(item => {
            return {
                product_id: item[0],
                name: this.topProductsNames.get(item[0]),
                qty: item[1],
            } as Product;
        });
    }

    processNext(data: any): void {
    }

    result(): object {
        throw new Error('Method not implemented.');
    }
}

export class CartCalculator extends Calculator {
    private abandonedCarts: number = 0;
    private totalCarts: number = 0;

    private addAbandoned = (abandoned: boolean) => {
        abandoned && this.abandonedCarts++;
    };
    private addTotal = () => {
        this.totalCarts++;
    };

    processNext(data: Cart): void {
        this.addAbandoned(!data.is_converted);
        this.addTotal();
        this.addProductCounter((!data.is_converted && data.products) || []);
    };

    result(): CartReport {
        const rate: number = Math.round((this.abandonedCarts / this.totalCarts) * 100) ;
        const top5 = this.getTopProducts();
        return {
            abandonedCartRate: rate || 0,
            topProductsAbandoned: top5
        }
    }
}

export class OrderCalculator extends Calculator {
    private ordersCount: number = 0;
    private ordersTotalAmount: number = 0;
    private salesPerDay: Map<string, number> = new Map();

    private addOrdersTotalAmount = (amount:number) => {
        this.ordersTotalAmount += amount;
    };

    private addOrderCount = () => {
        this.ordersCount++;
    };

    private calcSalesPerDay(data: any): void {
        const date = data.created_at && data.created_at.split("T")[0];
        const exAmount = this.salesPerDay.get(date);
        if (exAmount) {
            this.salesPerDay.set(date, exAmount + data.grand_total);
        }
        else {
            this.salesPerDay.set(date, data.grand_total);
        }
    }

    processNext(data: Order): void {
        this.addOrdersTotalAmount(data.grand_total || 0);
        this.addOrderCount();
        this.addProductCounter((data.products || []));
        this.calcSalesPerDay(data);
    };

    result(): OrderReport {
        const average = Math.floor(this.ordersTotalAmount/this.ordersCount)
        const top5 = this.getTopProducts();
        const sales:Array<SalesPerDay> = Array
            .from(this.salesPerDay.entries())
            .map((item) => ({ date: item[0], total: Number(item[1].toFixed(2))}) )
            .sort((a, b) => {
                // @ts-ignore
                return a[0] - b[0];
            });

        return {
            orderAverage: average || 0,
            topProductsPurchased: top5,
            salesPerDay:sales ||  []
        }
    }
}
