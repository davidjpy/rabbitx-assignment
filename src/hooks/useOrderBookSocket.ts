import { useEffect, useRef, useState } from 'react'
import { Centrifuge } from 'centrifuge'

import type { Order, OrderList, OrderBlock } from '@/utilities/types'

type Operation = 'Add' | 'Update' | 'Delete'

interface OrderBookData {
    timestamp: number
    sequence: number
    market_id: string
    asks: OrderList<string>
    bids: OrderList<string>
}

// compose the raw order into order block for rendering
const composeOrderBlock = (order: Order<string | number>, accumulatedAmount: number): OrderBlock => {
    return {
        price: Number(order[0]),
        amount: Number(order[1]),
        total: (Number(order[1]) + accumulatedAmount).toFixed(4)
    }
}

// Use binary search (log(n)) to get the insertion index
const getInsertIndexFromSortedArray = (array: number[], value: number) => {
    let low = 0,
        high = array.length

    while (low < high) {
        var mid = (low + high) >>> 1

        if (Number(array[mid]) < Number(value)) {
            low = mid + 1
        } else high = mid
    }

    return low
}

// extract the business logic from the component to a hook
export const useOrderBookSocket = (url: string, channel: string, token: string) => {
    const currentSequenceNumberRef = useRef<number>(Infinity)
    const asksPriceSizeMapRef = useRef<Map<number, number>>(new Map())
    const asksPriceSequenceRef = useRef<number[]>([])

    const bidsPriceSizeMapRef = useRef<Map<number, number>>(new Map())
    const bidsPriceSequenceRef = useRef<number[]>([])

    const [asksOrderBlocks, setAsksOrderBlocks] = useState<OrderBlock[]>([])
    const [bidsOrderBlocks, setBidsOrderBlocks] = useState<OrderBlock[]>([])

    // determine which operation to perform
    const getOperation = (priceSizeMap: Map<number, number>, price: number, size: number): Operation => {
        const isExistingPriceLevel = priceSizeMap.has(price)

        return isExistingPriceLevel && size > 0 ? 'Update' : isExistingPriceLevel && size === 0 ? 'Delete' : 'Add'
    }

    // update existing price level
    const updatePriceSizeMap = (
        _priceSequenceRef: React.MutableRefObject<number[]>,
        priceSizeMapRef: React.MutableRefObject<Map<number, number>>,
        order: Order<number>
    ): void => {
        priceSizeMapRef.current.set(order[0], order[1])
    }

    // add new price level to map & sequence
    const addNewPriceLevel = (
        priceSequenceRef: React.MutableRefObject<number[]>,
        priceSizeMapRef: React.MutableRefObject<Map<number, number>>,
        order: Order<number>
    ): void => {
        updatePriceSizeMap(priceSequenceRef, priceSizeMapRef, order)
        const insertIndex = getInsertIndexFromSortedArray(priceSequenceRef.current, order[0])
        priceSequenceRef.current.splice(insertIndex, 0, order[0])
    }

    // delete the price level from map & sequence
    const deletePriceLevel = (
        priceSequenceRef: React.MutableRefObject<number[]>,
        priceSizeMapRef: React.MutableRefObject<Map<number, number>>,
        order: Order<number>
    ): void => {
        priceSizeMapRef.current.delete(order[0])
        const deleteIndex = getInsertIndexFromSortedArray(priceSequenceRef.current, order[0])
        priceSequenceRef.current.splice(deleteIndex, 1)
    }

    const operationMap: Record<
        Operation,
        (
            priceSequenceRef: React.MutableRefObject<number[]>,
            priceSizeMapRef: React.MutableRefObject<Map<number, number>>,
            order: Order<number>
        ) => void
    > = {
        Add: addNewPriceLevel,
        Update: updatePriceSizeMap,
        Delete: deletePriceLevel
    }

    useEffect(() => {
        const centrifuge = new Centrifuge(url, { token: token })
        const subscription = centrifuge.newSubscription(channel)

        // get & set the initial snapshot
        subscription.on('subscribed', (ctx) => {
            const data: OrderBookData = ctx.data

            let asksAccumulatedAmount = 0
            let bidsAccumulatedAmount = 0
            let asksOrderBlockTemp: OrderBlock[] = []
            let bidsOrderBlockTemp: OrderBlock[] = Array(data.bids.length).fill(null)

            data.asks.forEach((ask) => {
                // set price-to-size hashmap
                asksPriceSizeMapRef.current.set(Number(ask[0]), Number(ask[1]))
                // set price level to an ordered list
                asksPriceSequenceRef.current.push(Number(ask[0]))
                // compose and set the order block to buffer
                asksOrderBlockTemp.push(composeOrderBlock(ask, asksAccumulatedAmount))
                // calculate total in ascending order
                asksAccumulatedAmount += Number(ask[1])
            })

            bidsPriceSequenceRef.current = Array(data.bids.length).fill(null)
            for (let i = data.bids.length - 1; i >= 0; i--) {
                // set price-to-size hashmap
                bidsPriceSizeMapRef.current.set(Number(data.bids[i][0]), Number(data.bids[i][1]))
                // set price level to an ordered list
                bidsPriceSequenceRef.current[i] = Number(data.bids[i][0])
                // compose and set the order block to buffer
                bidsOrderBlockTemp[i] = composeOrderBlock(data.bids[i], bidsAccumulatedAmount)
                // calculate total in descending order
                bidsAccumulatedAmount += Number(data.bids[i][1])
            }

            // record current sequence number
            currentSequenceNumberRef.current = Number(data.sequence)

            // trigger rerendering
            setAsksOrderBlocks(asksOrderBlockTemp)
            setBidsOrderBlocks(bidsOrderBlockTemp)
        })

        // subscribe to the socket
        subscription.on('publication', (ctx) => {
            const data: OrderBookData = ctx.data

            // check for any package loss
            const isPackageLoss = Number(data.sequence) !== currentSequenceNumberRef.current + 1

            // handle package loss
            if (isPackageLoss) {
                console.error('package loss')
                // logic.....
                return
            }

            // check for new ask orders
            if (data.asks.length) {
                data.asks.forEach((ask) => {
                    // choose which operation to perform (update existing price, add new price, delete exsting price)
                    const operation = getOperation(asksPriceSizeMapRef.current, Number(ask[0]), Number(ask[1]))
                    operationMap[operation](asksPriceSequenceRef, asksPriceSizeMapRef, [Number(ask[0]), Number(ask[1])])
                })

                let asksAccumulatedAmount = 0
                let asksOrderBlockTemp: OrderBlock[] = []

                // calculate new totals for order block in ascending order
                asksPriceSequenceRef.current.forEach((askPrice) => {
                    const askSize = asksPriceSizeMapRef.current.get(askPrice)

                    if (askSize) {
                        asksOrderBlockTemp.push(composeOrderBlock([askPrice, askSize], asksAccumulatedAmount))
                        asksAccumulatedAmount += Number(askSize)
                    }
                })

                // trigger rerendering
                setAsksOrderBlocks(asksOrderBlockTemp)
            }

            // check for new bid orders
            if (data.bids.length) {
                data.bids.forEach((bid) => {
                    // choose which operation to perform (update existing price, add new price, delete exsting price)
                    const operation = getOperation(bidsPriceSizeMapRef.current, Number(bid[0]), Number(bid[1]))
                    operationMap[operation](bidsPriceSequenceRef, bidsPriceSizeMapRef, [Number(bid[0]), Number(bid[1])])
                })

                let bidsAccumulatedAmount = 0
                let bidsOrderBlockTemp: OrderBlock[] = Array(bidsPriceSequenceRef.current.length).fill(null)

                // calculate new totals for order block in descending order
                for (let i = bidsPriceSequenceRef.current.length - 1; i >= 0; i--) {
                    const bidSize = bidsPriceSizeMapRef.current.get(bidsPriceSequenceRef.current[i])

                    if (bidSize) {
                        bidsOrderBlockTemp[i] = composeOrderBlock(
                            [bidsPriceSequenceRef.current[i], bidSize],
                            bidsAccumulatedAmount
                        )
                        bidsAccumulatedAmount += Number(bidSize)
                    }
                }

                // trigger rerendering
                setBidsOrderBlocks(bidsOrderBlockTemp)
            }

            // set current sequence number
            currentSequenceNumberRef.current = Number(data.sequence)
        })

        centrifuge.on('error', (ctx) => {
            console.log('error')
        })

        centrifuge.on('connecting', (ctx) => {
            console.log('connecting')
        })

        centrifuge.on('connected', (ctx) => {
            console.log('connected')
        })

        centrifuge.connect()
        subscription.subscribe()

        // disconnect socket when component unmounts
        return () => {
            centrifuge.disconnect()
        }
    }, [])

    return [asksOrderBlocks, bidsOrderBlocks]
}
