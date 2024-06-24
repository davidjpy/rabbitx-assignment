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
    const asksOrderBlocksRenderList = asksOrderBlocks.slice(0, rows).reverse()
    const bidsOrderBlocksRenderList = bidsOrderBlocks.slice(-rows).reverse()

    return (
        <section className='w-fit bg-[#101624] pb-4 pr-4 pt-4 font-medium'>
            <header className='mb-2 flex justify-between text-[#596379]'>
                <h1 className='w-[150px] pl-2 text-lg'>
                    Price <span className='rounded-md bg-[#202A3F] p-[2px] text-sm'>{currency}</span>
                </h1>
                <h1 className='w-[150px] pr-4 text-end text-lg'>
                    Amount <span className='rounded-md bg-[#202A3F] p-[2px] text-sm'>{symbol}</span>
                </h1>
                <h1 className='w-[150px] pr-2 text-end text-lg'>
                    Total <span className='rounded-md bg-[#202A3F] p-[2px] text-sm'>{symbol}</span>
                </h1>
            </header>
            <ul>
                {asksOrderBlocksRenderList.map((orderBlock) => (
                    <li key={orderBlock.price} className='group flex'>
                        <h5 className='w-[150px] rounded-md pl-2 text-[#CB3C50] group-last:bg-[#472233]'>
                            {orderBlock.price}
                        </h5>
                        <h5 className='w-[150px] pr-4 text-end text-[#727B8E]'>{orderBlock.amount}</h5>
                        <span className='relative w-[150px] pr-2 text-end text-[#727B8E]'>
                            <h5 className='relative z-50'>{orderBlock.total}</h5>
                            <span
                                className='absolute left-0 top-0 z-0 h-full bg-[#472233] opacity-70'
                                style={{
                                    width: `${(Number(orderBlock.total) / Number(asksOrderBlocksRenderList[0].total)) * 100}%`
                                }}
                            ></span>
                        </span>
                    </li>
                ))}
            </ul>
            <div></div>
            <ul>
                {bidsOrderBlocksRenderList.map((orderBlock) => (
                    <li key={orderBlock.price} className='group flex'>
                        <h5 className='w-[150px] rounded-md pl-2 text-[#16BC8F] group-first:bg-[#113A42]'>
                            {orderBlock.price}
                        </h5>
                        <h5 className='w-[150px] pr-2 text-end text-[#727B8E]'>{orderBlock.amount}</h5>
                        <span className='relative w-[150px] pr-4 text-end text-[#727B8E]'>
                            <h5 className='relative z-50'>{orderBlock.total}</h5>
                            <span
                                className='absolute left-0 top-0 z-0 h-full bg-[#113A42] opacity-70'
                                style={{
                                    width: `${(Number(orderBlock.total) / Number(bidsOrderBlocksRenderList[rows - 1].total)) * 100}%`
                                }}
                            ></span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    )
}
