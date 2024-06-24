export type Order<T> = [T, T]

export type OrderList<T> = Order<T>[]

export interface OrderBlock {
    price: number
    amount: number
    total: string
}
