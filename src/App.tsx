import { useEffect } from 'react'

import { OrderBook } from '@/components/OrderBook'
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket'

const socketUrl = 'wss://api.prod.rabbitx.io/ws'
const channel = `orderbook:BTC-USD`
const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDAwMDAwMDAwIiwiZXhwIjo2NTQ4NDg3NTY5fQ.o_qBZltZdDHBH3zHPQkcRhVBQCtejIuyq8V1yj5kYq8'

function App() {
    const dsa = useOrderBookSocket(socketUrl, channel, token)

    return <></>
}

export default App
