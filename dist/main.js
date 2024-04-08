import { CartCalculator, OrderCalculator } from './report/report.calculator.js';
import path from 'node:path';
// @ts-ignore
import config from './appconfig.json' assert { type: 'json' };
import { cartTable, orderTable } from './util/print.js';
import { DataReader } from './report/report.datasourcing.js';
const webFeedSetup = () => {
    const cartCalculator = new CartCalculator();
    const orderCalculator = new OrderCalculator();
    const cartReader = new DataReader(config.cart_feed, cartCalculator);
    const orderReader = new DataReader(config.order_feed, orderCalculator);
    return {
        cartReader,
        orderReader,
    };
};
const localFeedSetup = () => {
    const cartPath = path.resolve(process.cwd(), config.sources_dir, config.cart_file_path);
    const orderPath = path.resolve(process.cwd(), config.sources_dir, config.order_file_path);
    const cartCalculator = new CartCalculator();
    const orderCalculator = new OrderCalculator();
    const cartReader = new DataReader(cartPath, cartCalculator);
    const orderReader = new DataReader(orderPath, orderCalculator);
    return {
        cartReader,
        orderReader,
    };
};
const setup = (useStream) => useStream ? webFeedSetup() : localFeedSetup();
export async function execute() {
    try {
        const useFeedVersion = config.use_feed_sources;
        const { cartReader, orderReader } = setup(useFeedVersion);
        // -> unnecessary block
        // we can also print progress here if necessary
        cartReader.on('progress', (data) => {
            // print ?
        });
        orderReader.on('progress', (data) => {
            // print ?
        });
        // <- unnecessary block
        cartReader.on('complete', (data) => {
            const report = cartTable(data);
            console.log('\n');
            console.log('Cart Report:');
            report.printTable();
        });
        orderReader.on('complete', (data) => {
            const report = orderTable(data);
            console.log('\n');
            console.log('Order Report:');
            report.printTable();
        });
        await Promise.all([cartReader.read(), orderReader.read()]);
    }
    catch (err) {
        console.log('\n');
        console.error(err.message, err?.origin);
        process.exit(1);
    }
}
await execute();
