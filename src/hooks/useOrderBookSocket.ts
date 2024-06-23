import { useEffect, useState } from 'react'
import { Centrifuge } from 'centrifuge'

import type { Order, OrderList, OrderBlock } from '@/utilities/types'

interface OrderBookData {
    timestamp: number
    sequence: number
    market_id: string
    asks: OrderList
    bids: OrderList
}

// Convert order to order block
const composeOrderBlock = (orderList: OrderList): OrderBlock[] => {
    let accumulatedAmount = 0

    const orderBlock: OrderBlock[] = orderList.reduce((acc: OrderBlock[], cur: Order) => {
        accumulatedAmount += Number(cur[1])
        acc.push({
            price: Number(cur[0]),
            amount: Number(cur[1]),
            total: accumulatedAmount
        })
        return acc
    }, [])

    return orderBlock
}

export const useOrderBookSocket = (url: string, channel: string, token: string) => {
    const [asks, setAsks] = useState<OrderBlock[]>([])
    const [bids, setBids] = useState<OrderBlock[]>([])

    useEffect(() => {
        const centrifuge = new Centrifuge(url, { token: token })
        const subscription = centrifuge.newSubscription(channel)

        subscription.on('publication', (ctx) => {
            const data: OrderBookData = ctx.data
            const asksOrderBlock = composeOrderBlock(data.asks)
            const bidsOrderBlock = composeOrderBlock(data.bids)

            console.log(asksOrderBlock, bidsOrderBlock)
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

        subscription.subscribe()
        centrifuge.connect()

        // disconnect socket when component unmounts
        return () => {
            centrifuge.disconnect()
        }
    }, [])
}
