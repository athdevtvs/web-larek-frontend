import { PAYMENT_METHOD } from '../utils/constants';

//Описание товара
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	selected: boolean;
}

//Метод оплаты
type PaymentMethodTuple = typeof PAYMENT_METHOD;
export type PaymentMethod = PaymentMethodTuple[number];

//Описание заказа
export interface IOrder {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

//Содержимое карточки товара корзины
export interface ICard extends IProduct {
	index: string;
	button: string;
}

//Поля с формы заказа
export type TOrderForm = Pick<IOrder, 'payment' | 'address'>;

//Поля с формы контактов
export type TContactForm = Pick<IOrder, 'email' | 'phone'>;

//
export interface IOrderResult {
	id: string;
	total: number;
}

//Ошибки формы
export type TFormErrors = Partial<Record<keyof IOrder, string>>;

//Список с ответами на запросы по API
export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

//Набор HTTP методов
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

//Событие по клику
export interface IActions {
	onClick: (event: MouseEvent) => void;
}

//Работа с событиями (установка/снятие слушателей, вызов слушателя)
export interface IEvents {
	on<T extends object>(event: string, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

//Методы взаимодействие с API магазина
export interface IMagazinusApi {
	getProductList: () => Promise<IProduct[]>;
	placeOrder: (order: IOrder) => Promise<IOrderResult>;
}

//Общие поля и методы для работы с корзиной
export interface IBasketModel {
	items: IProduct[];
	price: number;
	isInBasket: (item: IProduct) => boolean;
	addToBasket: (item: IProduct) => void;
	deleteFromBasket: (item: IProduct) => void;
	clearBasket: () => void;
}

//Общие поля и методы для работы с каталогом
export interface ICatalogModel {
	items: IProduct[];
	selectedItem: IProduct;
	preview: IProduct;
}

//Общие поля и методы для работы с заказом
export interface IOrderModel {
	order: IOrder;
	formErrors: TFormErrors;
	setOrderAddress: (field: keyof TOrderForm, value: string) => void;
	validateOrderAddressAndPayment: () => boolean;
	setOrderContacts: (field: keyof TContactForm, value: string) => void;
	validateContacts: () => boolean;
}

//Состояние формы
export interface IFormState {
	valid: boolean;
	errors: string[];
}

//Контент модального окна
export interface IModalData {
	content: HTMLElement;
}

//Общая стоимость заказа
export interface ISuccess {
	total: number;
}

//Событие по клику
export interface ISuccessActions {
	onClick: () => void;
}

//Отображение корзины
export interface IBasketView {
	items: HTMLElement[];
	price: number;
	setIndexes(): void;
	toggleButton(state: boolean): void;
}

//Форма заказа
export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
	onPaymentMethodSelect: (name: string) => void;
}

//Отображение главной страницы
export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

// Все события магазина
export enum Events {
	ITEMS_CHANGE = 'items:change', //отобразить содержимое каточки с товарами
	CARD_SELECT = 'card:select', //показать превью карточки товара
	PREVIEW_CHANGE = 'preview:change', //скастоваться на изменения в модалке с карточкой товара
	BASKET_CHANGE = 'basket:change', //скастоваться на изменения в корзине
	BASKET_OPEN = 'basket:open', //открыть содержимое корзины
	ORDER_OPEN = 'order:open', //открыть форму заказа
	ORDER_SUBMIT = 'order:submit', //открыть форму контактов
	ORDER_READY = 'order:ready', //пробросить пользователя на стр. success
	FORM_ERRORS_ADRESS = 'formErrors:address', //Изменилось состояние валидации формы
	FORM_ERRORS_CONTACTS = 'formErrors:contacts', //Изменилось состояние валидации формы
	ORDER_PAYMENT_CHANGE = 'order:payment:change', //Изменился способ оплаты
	CONTACTS_SUBMIT = 'contacts:submit', //Размещение заказа
	MODAL_OPEN = 'modal:open', //Открытие модального окна
	MODAL_CLOSE = 'modal:close', //Закрытие модального окна
}
