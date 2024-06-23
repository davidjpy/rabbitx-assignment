export type Order = [string, string]

export type OrderList = Order[]

export interface OrderBlock {
    price: number
    amount: number
    total: number
}
