import { Form } from './common/form';
import { IOrder, IOrderForm, Events } from '../../types';
import { IEvents } from '../base/events';
import { ensureAllElements } from '../../utils/utils';

export class OrderForm extends Form<IOrder> implements IOrderForm {
	protected _paymentButtons: HTMLButtonElement[];
	protected _button: HTMLButtonElement;
	protected _address: HTMLInputElement;
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._address = this.container.elements.namedItem('address') as HTMLInputElement;
		this._email = this.container.elements.namedItem('email') as HTMLInputElement;
		this._phone = this.container.elements.namedItem('phone') as HTMLInputElement;

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
		this._address.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	onPaymentMethodSelect(name: string) {
		this.payment = name;
		this.events.emit(Events.ORDER_PAYMENT_CHANGE, { name });
	}
}
