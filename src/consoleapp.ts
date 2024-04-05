import {InMemoryCollector, StreamCollector} from './report/report.collector.js'

import {CartCalculator, OrderCalculator} from "./report/report.calculator.js";
import {createReadableFsStream, createReadableWebStream} from "./report/report.datasource.js";
import path from "node:path";

// @ts-ignore
import config from './appconfig.json' assert {type: 'json'};
import {debouncedPrintReport} from "./util/print.js";


const streamSetup = () => {
    const cartCalculator = new CartCalculator();
    const orderCalculator = new OrderCalculator();

    const orderStream = createReadableWebStream(config.cart_feed);
    const cartStream = createReadableWebStream(config.order_feed);
    const cartCollector = new StreamCollector();
    const orderCollector = new StreamCollector();

    return {
        cartCollector, orderCollector,
        orderPromise: orderCollector.collect(orderStream, orderCalculator),
        cartPromise: cartCollector.collect(cartStream, cartCalculator)
    }
}

const inMemorySetup = () => {
    const cartCalculator = new CartCalculator();
    const orderCalculator = new OrderCalculator();

    const cartPath = path.resolve(process.cwd(), config.sources_dir, config.cart_file_path)
    const orderPath = path.resolve(process.cwd(), config.sources_dir, config.order_file_path)

    const cartStream = createReadableFsStream(cartPath);
    const orderStream = createReadableFsStream(orderPath);

    const cartCollector = new InMemoryCollector();
    const orderCollector = new InMemoryCollector();

    return {
        cartCollector, orderCollector,
        orderPromise: orderCollector.collect(orderStream, orderCalculator),
        cartPromise: cartCollector.collect(cartStream, cartCalculator)
    }
}

const setup = (useStream:boolean) => useStream ? streamSetup() : inMemorySetup();


export async function execute() {
    try {
        const useFeedVersion = config.use_feed_sources;
        const {
            cartCollector, orderCollector,
            orderPromise, cartPromise
        } = setup(useFeedVersion);

        debouncedPrintReport([cartCollector, orderCollector]);

        await Promise.all([orderPromise, cartPromise])

        // console.log("cartCalculator.result: ", cartCollector.calculator.result());
        // console.log("orderCalculator.result: ", orderCollector.calculator.result());
    } catch (err: any) {
        console.error(err);
    }
}
