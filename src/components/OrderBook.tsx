import type { OrderBlock } from '@/utilities/types'

interface Props {
    asksOrderBlocks: OrderBlock[]
    bidsOrderBlocks: OrderBlock[]
    rows: number
    symbol: string
    currency: string
}

// isolated presentation layer for rending ui
export function OrderBook({ asksOrderBlocks, bidsOrderBlocks, rows, symbol, currency }: Props) {
    return (
        <section className='w-fit bg-[#101624] font-medium'>
            <header className='flex gap-[60px] justify-between text-[#596379]'>
                <h1>
                    Price <span>{currency}</span>
                </h1>
                <h1>
                    Amount <span>{symbol}</span>
                </h1>
                <h1>
                    Total <span>{symbol}</span>
                </h1>
            </header>
            <ul>
                {asksOrderBlocks
                    .slice(0, rows)
                    .reverse()
                    .map((orderBlock) => (
                        <li key={orderBlock.price} className='flex justify-between'>
                            <span className='text-[#CB3C50]'>{orderBlock.price}</span>
                            <span className='text-[#727B8E]'>{orderBlock.amount}</span>
                            <span className='text-[#727B8E]'>{orderBlock.total}</span>
                        </li>
                    ))}
            </ul>
            <ul></ul>
        </section>
    )
}
