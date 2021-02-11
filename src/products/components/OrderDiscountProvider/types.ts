import { Money } from "@saleor/fragments/types/Money";
import { OrderDiscountCommonInput } from "@saleor/orders/components/OrderLineDiscountModal/types";

export interface OrderDiscountData extends OrderDiscountCommonInput {
  amount: Money;
}
