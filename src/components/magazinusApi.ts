import { Api } from './base/api';
import { ApiListResponse } from '../types';
import { IMagazinusApi, IOrder, IOrderResult, IProduct } from '../types';

export class MagazinusApi extends Api implements IMagazinusApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	//Получить карточки с сервера
	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	//Разместить заказ и получить по нему ответ
	placeOrder(order: IOrder): Promise<IOrderResult> {
		return this.post(`/order`, order).then((data: IOrderResult) => data);
	}
}
