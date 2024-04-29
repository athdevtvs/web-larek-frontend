import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ensureElement, cloneTemplate, isPaymentKey } from './utils/utils';
import { IProduct, TOrderForm, TContactForm, PaymentMethod, ICard, Events } from './types';
import { MagazinusApi } from './components/magazinusApi';
import { CatalogModel } from './components/model/catalogModel';
import { BasketModel } from './components/model/basketModel';
import { OrderModel } from './components/model/orderModel';
import { Page } from './components/view/page';
import { Modal } from './components/view/common/modal';
import { Card } from './components/view/card';
import { Basket } from './components/view/basket';
import { OrderForm } from './components/view/orderForm';
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
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new OrderForm(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();
	},
});

//Получаем список с товарами
api
	.getProductList()
	.then((data: IProduct[]) => (catalogModel.items = data))
	.catch(console.error);

//Отобразить карточки с товарами на странице
events.on(Events.ITEMS_CHANGE, (items: IProduct[]) => {
	page.catalog = items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit(Events.CARD_SELECT, item),
		});
		return card.render(item);
	});
});

//Показать превью карточки товара при клике по ней
events.on(Events.CARD_SELECT, (item: IProduct) => {
	catalogModel.preview = item;
});

//Скастоваться на изменения в модалке с карточкой товара
events.on(Events.PREVIEW_CHANGE, (item: IProduct) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (basketModel.isInBasket(item)) {
				basketModel.deleteFromBasket(item);
				card.button = 'В корзину';
			} else {
				basketModel.addToBasket(item);
				card.button = 'Удалить из корзины';
				modal.close();
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
events.on(Events.BASKET_CHANGE, (items: ICard[]) => {
	page.counter = basketModel.items.length;

	basket.items = items.map((basketItem, index) => {
		const item = catalogModel.items.find((catalogItem) => catalogItem.id === basketItem.id);
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => basketModel.deleteFromBasket(item),
		});
		return card.render({
			index: String(index + 1),
			title: item.title,
			price: item.price,
		});
	});

	basket.price = basketModel.price;
	orderModel.order.total = basketModel.price;
});

//Открыть содержимое корзины
events.on(Events.BASKET_OPEN, () => {
	modal.render({ content: basket.render() });
});

//Открыть форму заказа
events.on(Events.ORDER_OPEN, () => {
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
events.on(Events.ORDER_SUBMIT, () => {
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
events.on(Events.FORM_ERRORS_ADRESS, (errors: Partial<TOrderForm>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

//Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CONTACTS, (errors: Partial<TContactForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

//Изменился способ оплаты
events.on(Events.ORDER_PAYMENT_CHANGE, ({ name }: { name: PaymentMethod }) => {
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
events.on(Events.CONTACTS_SUBMIT, () => {
	api
		.placeOrder(orderModel.order)
		.then(() => {
			success.total = `Списано ${orderModel.order.total} синапсов`;
			basketModel.clearBasket();

			modal.render({ content: success.render({}) });
		})
		.catch((err) => console.error(err));
});

//Заблокировать основную страницу при открытии модалки
events.on(Events.MODAL_OPEN, () => {
	page.locked = true;
});

//Разблокировать основную страницу при закрытии модалки
events.on(Events.MODAL_CLOSE, () => {
	page.locked = false;
});
