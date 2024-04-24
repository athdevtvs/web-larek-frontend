import { Component } from '../base/component';
import { IBasketView } from '../../types';
import { createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _price: HTMLSpanElement;
	protected _button: HTMLButtonElement;

	constructor(readonly container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._price = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => events.emit('order:open'));
		}

		this.items = [];
	}

	//Отрисовать позиции с товаром в корзине
	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this.toggleButton(true);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.toggleButton(false);
		}
	}

	//Отрисовать полную стоимость корзины
	set price(price: number) {
		this.setText(this._price, `${price} синапсов`);
	}

	//Отрисовать индексы у позиций в корзине
	setIndexes() {
		Array.from(this._list.children).forEach(
			(item, index) => (item.querySelector('.basket__item-index').textContent = String(index + 1))
		);
	}

	//Изменить состояние кнопки с активного на неактиваное и в обратную сторону
	toggleButton(state: boolean) {
		this.setDisabled(this._button, !state);
	}
}
