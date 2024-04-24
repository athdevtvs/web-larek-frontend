import { Model } from '../base/model';
import { IBasketModel, IProduct } from '../../types';
import { IEvents } from '../base/events';

export class BasketModel extends Model<IProduct> implements IBasketModel {
	protected _items: IProduct[]; // список позиций с товаром в корзине
	price: number; //стоимость всей корзины

	constructor(protected data: Partial<IProduct>, protected events: IEvents) {
		super({}, events);
		this._items = [];
		this.price = 0;
	}

	//Установить значения для списка позиций с товаром в корзине
	set items(item: IProduct[]) {
		this._items = item;
	}

	//Забрать список позиций с товаром в корзине
	get items() {
		return this._items;
	}

	//Проверить наличие товара в корзине
	isInBasket(item: IProduct) {
		return this._items.includes(item);
	}

	//Добавить позицию с товаром в корзину
	addToBasket(item: IProduct) {
		this._items.push(item);
		this.price += item.price;
		this.emitChanges('basket:change', this._items);
	}

	//Удалить позицию с товаром из корзины
	deleteFromBasket(item: IProduct) {
		this._items = this._items.filter((id) => id !== item);
		this.price -= item.price;
		this.emitChanges('basket:change', this._items);
	}

	//Очистить корзину
	clearBasket() {
		this._items.length = 0;
		this.emitChanges('basket:change', this._items);
	}
}
