import { OrderBook } from '@/components/OrderBook'
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket'

// credentials, should be stored in env variables
const socketUrl = 'wss://api.prod.rabbitx.io/ws'
const socketSymbol = 'BTC-USD'
const bookChannel = `orderbook:${socketSymbol}`
const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDAwMDAwMDAwIiwiZXhwIjo2NTQ4NDg3NTY5fQ.o_qBZltZdDHBH3zHPQkcRhVBQCtejIuyq8V1yj5kYq8'

const symbol = 'BTC'
const rows = 11
const currency = 'USD'
// business layer to handle data
function App() {
    const { asksOrderBlocks, bidsOrderBlocks } = useOrderBookSocket(socketUrl, bookChannel, token)

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
