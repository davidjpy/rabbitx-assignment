import { useEffect } from 'react'

import { OrderBook } from '@/components/OrderBook'
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket'

// credentials, should be stored in env variables
const socketUrl = 'wss://api.prod.rabbitx.io/ws'
const channel = `orderbook:BTC-USD`
const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDAwMDAwMDAwIiwiZXhwIjo2NTQ4NDg3NTY5fQ.o_qBZltZdDHBH3zHPQkcRhVBQCtejIuyq8V1yj5kYq8'

const rows = 11
const symbol = 'BTC'
const currency = 'USD'
// business layer to handle data
function App() {
    const [asksOrderBlocks, bidsOrderBlocks] = useOrderBookSocket(socketUrl, channel, token)

    // isolated presentation layer for rending ui
    return (
        <OrderBook
            asksOrderBlocks={asksOrderBlocks}
            bidsOrderBlocks={bidsOrderBlocks}
            rows={rows}
            symbol={symbol}
            currency={currency}
        />
    )
}

export default App
