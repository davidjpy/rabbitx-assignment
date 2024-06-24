import type { OrderBlock } from '@/utilities/types'

interface Props extends React.ComponentProps<'ul'> {
    orderBlock: OrderBlock[]
}

// isolated order block entry presentation layer for rending ui
export function OrderBlockEntry({ orderBlock, children }: Props) {
    return (
        <ul className='h-[300px] pb-4 pt-4'>
            {orderBlock.length ? <>{children}</> : <h1 className='text-center text-2xl text-[#727B8E]'>No Data</h1>}
        </ul>
    )
}
