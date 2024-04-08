export const TOP_FIFE = 5;
export class Calculator {
    topProducts = new Map();
    topProductsNames = new Map();
    addProductCounter = (products) => {
        products.forEach((product) => {
            const exCount = this.topProducts.get(product.product_id);
            if (exCount) {
                this.topProducts.set(product.product_id, exCount + product.qty);
            }
            else {
                this.topProducts.set(product.product_id, 1);
                this.topProductsNames.set(product.product_id, product.name);
            }
        });
    };
    getTopProducts() {
        const products = Array.from(this.topProducts.entries()).sort((a, b) => b[1] - a[1]);
        return products.slice(0, TOP_FIFE).map((item) => {
            return {
                product_id: item[0],
                name: this.topProductsNames.get(item[0]),
                qty: item[1],
            };
        });
    }
    processNext(data) { }
    result() {
        throw new Error('Method not implemented.');
    }
}
export class CartCalculator extends Calculator {
    abandonedCarts = 0;
    totalCarts = 0;
    addAbandoned = (abandoned) => {
        abandoned && this.abandonedCarts++;
    };
    addTotal = () => {
        this.totalCarts++;
    };
    processNext(data) {
        this.addAbandoned(!data.is_converted);
        this.addTotal();
        this.addProductCounter((!data.is_converted && data.products) || []);
    }
    result() {
        const rate = Math.round((this.abandonedCarts / this.totalCarts) * 100);
        const top5 = this.getTopProducts();
        return {
            abandonedCartRate: rate || 0,
            topProductsAbandoned: top5,
        };
    }
}
export class OrderCalculator extends Calculator {
    ordersCount = 0;
    ordersTotalAmount = 0;
    salesPerDay = new Map();
    addOrdersTotalAmount = (amount) => {
        this.ordersTotalAmount += amount;
    };
    addOrderCount = () => {
        this.ordersCount++;
    };
    calcSalesPerDay(data) {
        const date = data.created_at && data.created_at.split('T')[0];
        const exAmount = this.salesPerDay.get(date);
        if (exAmount) {
            this.salesPerDay.set(date, exAmount + data.grand_total);
        }
        else {
            this.salesPerDay.set(date, data.grand_total);
        }
    }
    processNext(data) {
        this.addOrdersTotalAmount(data.grand_total || 0);
        this.addOrderCount();
        this.addProductCounter(data.products || []);
        this.calcSalesPerDay(data);
    }
    result() {
        const average = Math.floor(this.ordersTotalAmount / this.ordersCount);
        const top5 = this.getTopProducts();
        const sales = Array.from(this.salesPerDay.entries())
            .map((item) => ({ date: item[0], total: Number(item[1].toFixed(2)) }))
            .sort((a, b) => {
            // @ts-ignore
            return a[0] - b[0];
        });
        return {
            orderAverage: average || 0,
            topProductsPurchased: top5,
            salesPerDay: sales || [],
        };
    }
}
