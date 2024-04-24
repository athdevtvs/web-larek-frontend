import { Model } from '../base/model';
import { IOrderModel, IOrder, TContactForm, TOrderForm } from '../../types';
import { IEvents } from '../base/events';
import { TFormErrors } from '../../types/index';

export class OrderModel extends Model<IOrder> implements IOrderModel {
	order: IOrder;
	formErrors: TFormErrors = {};

	constructor(protected data: Partial<IOrder>, protected events: IEvents) {
		super({}, events);
		this.order = {
			payment: undefined,
			email: '',
			phone: '',
			address: '',
			total: 0,
			items: [],
		};
	}

	setOrderAddress(field: keyof TOrderForm, value: string) {
		if (field === 'address') {
			this.order.address = value;
		}

		if (this.validateOrderAddressAndPayment()) {
			this.emitChanges('order:ready', this.order);
		}
	}

	validateOrderAddressAndPayment() {
		const addressRegexp = /^(?:[а-яА-ЯёЁ0-9\S .-]+,){4,}[а-яА-ЯёЁ0-9\S .-]+$/;
		const errors: typeof this.formErrors = {};

		if (!this.order.payment) {
			errors.payment = 'Выберите способ оплаты';
		} else if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		} else if (!addressRegexp.test(this.order.address)) {
			errors.address = 'Укажите существующий адрес, напр. "Индекс, город, улица, дом, строение, квартира"';
		}

		this.formErrors = errors;
		this.emitChanges('formErrors:address', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	setOrderContacts(field: keyof TContactForm, value: string) {
		if (field === 'email') {
			this.order.email = value;
		} else if (field === 'phone') {
			this.order.phone = value;
		}

		if (this.validateContacts()) {
			this.emitChanges('order:ready', this.order);
		}
	}

	validateContacts() {
		const emailRegexp =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const phoneRegexp = /^[+]?[0-9]?[\s.]?[(]?[0-9]{3}[)]?[\s.]?[0-9]{3}[-\s.]?[0-9]{2}[-\s.]?[0-9]{2}$/;
		const errors: typeof this.formErrors = {};

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		} else if (!emailRegexp.test(this.order.email)) {
			errors.email = 'Некорректный адрес электронной почты';
		}

		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!phoneRegexp.test(this.order.phone)) {
			errors.phone = 'Некорректный формат номера телефона';
		}

		this.formErrors = errors;
		this.emitChanges('formErrors:contacts', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
