import { Form } from './common/form';
import { IOrder, IOrderForm } from '../../types';
import { IEvents } from '../base/events';
import { ensureAllElements } from '../../utils/utils';

export class Order extends Form<IOrder> implements IOrderForm {
	protected _paymentButtons: HTMLButtonElement[];
	protected _button: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
		this._paymentButtons.forEach((item) =>
			item.addEventListener('click', () => {
				this.onPaymentMethodSelect(item.name);
			})
		);
	}

	set payment(value: string) {
		this._paymentButtons.forEach((item) => this.toggleClass(item, 'button_alt-active', item.name === value));
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value = value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value = value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
	}

	onPaymentMethodSelect(name: string) {
		this.payment = name;
		this.events.emit('order:payment:change', { name });
	}
}
