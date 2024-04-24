import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ensureElement, cloneTemplate, isPaymentKey } from './utils/utils';
import { IProduct, TOrderForm, TContactForm, PaymentMethod } from './types';
import { MagazinusApi } from './components/magazinusApi';
import { CatalogModel } from './components/model/catalogModel';
import { BasketModel } from './components/model/basketModel';
import { OrderModel } from './components/model/orderModel';
import { Page } from './components/view/page';
import { Modal } from './components/view/common/modal';
import { Card } from './components/view/card';
import { Basket } from './components/view/basket';
import { Order } from './components/view/order';
import { Success } from './components/view/common/success';

const events = new EventEmitter();
const api = new MagazinusApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

//Модели данных приложения
const catalogModel = new CatalogModel({}, events);
const basketModel = new BasketModel({}, events);
const orderModel = new OrderModel({}, events);

//Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

//Переиспользуемые компоненты
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);

//Получаем список с товарами
api
	.getProductList()
	.then((data: IProduct[]) => (catalogModel.items = data))
	.catch((error) => console.log(error));

//Отобразить карточки с товарами на странице
events.on('items:change', (items: IProduct[]) => {
	page.catalog = items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
});

//Показать превью карточки товара при клике по ней
events.on('card:select', (item: IProduct) => {
	catalogModel.preview = item;
});

//Скастоваться на изменения в модалке с карточкой товара
events.on('preview:change', (item: IProduct) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (basketModel.isInBasket(item)) {
				basketModel.deleteFromBasket(item);
				card.button = 'В корзину';
			} else {
				basketModel.addToBasket(item);
				card.button = 'Удалить из корзины';
			}
		},
	});

	if (basketModel.isInBasket(item)) {
		card.button = 'Удалить из корзины';
	} else {
		card.button = 'В корзину';
	}

	modal.render({ content: card.render(item) });
});

//Скастоваться на изменения в корзине
events.on('basket:change', () => {
	page.counter = basketModel.items.length;

	basket.items = basketModel.items.map((basketItem) => {
		const item = catalogModel.items.find((catalogItem) => catalogItem.id === basketItem.id);
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => basketModel.deleteFromBasket(item),
		});
		return card.render(item);
	});

	if (basketModel.items.length !== 0) basket.setIndexes();
	basket.price = basketModel.price;
	orderModel.order.total = basketModel.price;
});

//Открыть содержимое корзины
events.on('basket:open', () => {
	modal.render({ content: basket.render() });
});

//Открыть форму заказа
events.on('order:open', () => {
	orderModel.order.items = basketModel.items.map((item) => item.id);

	modal.render({
		content: order.render({
			payment: undefined,
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

//Открыть форму контактов
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

//Изменилось состояние валидации формы
events.on('formErrors:address', (errors: Partial<TOrderForm>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

//Изменилось состояние валидации формы
events.on('formErrors:contacts', (errors: Partial<TContactForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

//Изменился способ оплаты
events.on('order:payment:change', ({ name }: { name: PaymentMethod }) => {
	if (isPaymentKey(name)) {
		orderModel.order.payment = name;
		orderModel.validateOrderAddressAndPayment();
	}
});

//Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof TOrderForm; value: string }) => {
	orderModel.setOrderAddress(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof TContactForm; value: string }) => {
	orderModel.setOrderContacts(data.field, data.value);
});

//Размещение заказа
events.on('contacts:submit', () => {
	api
		.placeOrder(orderModel.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			success.total = `Списано ${orderModel.order.total} синапсов`;
			basketModel.clearBasket();

			modal.render({ content: success.render({}) });
		})
		.catch((err) => console.error(err));
});

//Заблокировать основную страницу при открытии модалки
events.on('modal:open', () => {
	page.locked = true;
});

//Разблокировать основную страницу при закрытии модалки
events.on('modal:close', () => {
	page.locked = false;
});
