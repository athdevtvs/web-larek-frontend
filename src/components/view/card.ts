import { Component } from '../base/component';
import { IProduct, IActions } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CATEGORY_COLORS } from '../../utils/constants';

export class Card extends Component<IProduct> {
	protected _title: HTMLHeadingElement;
	protected _image: HTMLImageElement;
	protected _price: HTMLSpanElement;
	protected _category: HTMLSpanElement;
	protected _description?: HTMLParagraphElement;
	protected _button?: HTMLButtonElement;

	constructor(readonly container: HTMLElement, actions?: IActions) {
		super(container);

		this._title = ensureElement<HTMLHeadingElement>('.card__title', container);
		this._image = container.querySelector('.card__image');
		this._price = ensureElement<HTMLSpanElement>('.card__price', container);
		this._category = container.querySelector('.card__category');
		this._description = container.querySelector('.card__description');
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id() {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title() {
		return this._title.textContent || '';
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}

	set price(value: string) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
		if (this._button) this._button.disabled = !value;
		if (!value) this.setText(this._button, 'Не продается');
	}

	get price() {
		return this._price.textContent || '';
	}

	set category(value: string) {
		this.setText(this._category, value);
		if (this._category) this._category.className = `card__category card__category_${CATEGORY_COLORS[value]}`;
	}

	get category() {
		return this._category.textContent || '';
	}

	set image(src: string) {
		this.setImage(this._image, src, this.title);
	}
}
