import { OrderBlockEntry } from '@/components/OrderBlockEntry'

import type { OrderBlock } from '@/utilities/types'

interface Props {
    asksOrderBlocks: OrderBlock[]
    bidsOrderBlocks: OrderBlock[]
    rows: number
    symbol: string
    currency: string
}

// isolated order book presentation layer for rending ui
export function OrderBook({ asksOrderBlocks, bidsOrderBlocks, rows, symbol, currency }: Props) {
    const asksOrderBlocksRenderList = asksOrderBlocks.slice(0, rows).reverse()
    const bidsOrderBlocksRenderList = bidsOrderBlocks.slice(-rows).reverse()

    return (
        <section className='w-fit bg-[#101624] p-4 font-medium'>
            <header className='flex justify-between text-[#596379]'>
                <h1 className='w-[150px] pl-2 text-lg'>
                    Price <span className='rounded-md bg-[#202A3F] p-[4px] text-sm'>{currency}</span>
                </h1>
                <h1 className='w-[150px] text-end text-lg'>
                    Amount <span className='rounded-md bg-[#202A3F] p-[4px] text-sm'>{symbol}</span>
                </h1>
                <h1 className='ml-4 w-[150px] pr-2 text-end text-lg'>
                    Total <span className='rounded-md bg-[#202A3F] p-[4px] text-sm'>{symbol}</span>
                </h1>
            </header>

            <OrderBlockEntry orderBlock={asksOrderBlocksRenderList}>
                {asksOrderBlocksRenderList.map((orderBlock) => (
                    <li key={orderBlock.price} className='group flex'>
                        <h5 className='w-[150px] rounded-md pl-2 text-[#CB3C50] group-last:bg-[#472233]'>
                            {orderBlock.price.toLocaleString()}
                        </h5>
                        <h5 className='w-[150px] text-end text-[#727B8E]'>
                            {orderBlock.amount.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                        </h5>
                        <span className='relative ml-4 w-[150px] pr-2 text-end text-[#727B8E]'>
                            <h5 className='relative z-50'>
                                {orderBlock.total.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                            </h5>
                            <span
                                className='absolute left-0 top-0 z-0 h-full bg-[#472233] opacity-70'
                                style={{
                                    width: `${(Number(orderBlock.total) / Number(asksOrderBlocksRenderList[0].total)) * 100}%`
                                }}
                            ></span>
                        </span>
                    </li>
                ))}
            </OrderBlockEntry>

            <div className='flex h-[50px] items-center rounded-md bg-[#1A2235] pl-4 pr-4 text-xl'>
                <h1
                    className='text-[#16BC8F]'
                    style={{
                        display: bidsOrderBlocksRenderList.length ? 'block' : 'none'
                    }}
                >
                    {bidsOrderBlocksRenderList[0]?.price.toLocaleString()}
                </h1>
                <h1
                    className='ml-24 text-white'
                    style={{
                        display: bidsOrderBlocksRenderList.length && asksOrderBlocksRenderList.length ? 'block' : 'none'
                    }}
                >
                    {(
                        (bidsOrderBlocksRenderList[0]?.price +
                            asksOrderBlocksRenderList[asksOrderBlocksRenderList.length - 1]?.price) /
                        2
                    ).toLocaleString()}
                </h1>
            </div>

            <OrderBlockEntry orderBlock={bidsOrderBlocksRenderList}>
                {bidsOrderBlocksRenderList.map((orderBlock) => (
                    <li key={orderBlock.price} className='group flex'>
                        <h5 className='w-[150px] rounded-md pl-2 text-[#16BC8F] group-first:bg-[#113A42]'>
                            {orderBlock.price.toLocaleString()}
                        </h5>
                        <h5 className='w-[150px] text-end text-[#727B8E]'>
                            {orderBlock.amount.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                        </h5>
                        <span className='relative ml-4 w-[150px] pr-2 text-end text-[#727B8E]'>
                            <h5 className='relative z-50'>
                                {orderBlock.total.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                            </h5>
                            <span
                                className='absolute left-0 top-0 z-0 h-full bg-[#113A42] opacity-70'
                                style={{
                                    width: `${(Number(orderBlock.total) / Number(bidsOrderBlocksRenderList[bidsOrderBlocksRenderList.length - 1].total)) * 100}%`
                                }}
                            ></span>
                        </span>
                    </li>
                ))}
            </OrderBlockEntry>
        </section>
    )
}
