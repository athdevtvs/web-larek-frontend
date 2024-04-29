# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание архитектуры проекта

В работе используется шаблон проектирования пользовательского интерфейса Model-View-Presenter (MVP). Данный подход позволяет создавать абстракцию представления. Для этого выделяется интерфейс представления с определенным набором свойств и методов. Презентер, в свою очередь, получает ссылку на реализацию интерфейса, подписывается на события представления и по запросу изменяет модель. Каждое представление реализует соответствующий интерфейс. Интерфейс представления определяет набор функций и событий, необходимых для взаимодействия с пользователем. Все события представления передаются для обработки в презентер и практически никогда не обрабатываются логикой представления. Презентер (`./index.ts`) отвечает за взаимодействие данных (`./model/*`) и представлений (`./view/*`) описывая логику приложения. Взаимодействие происходит через события. Модели инициируют события, слушатели событий в Present'ере передают данные компонентам отображения.

Также в работе используется шаблон проектирования брокер событий (EventEmitter). Он дает возможность с любого места в приложении сообщить о каком-либо событии. Все, кто был подписан на это событие сразу же об этом узнают и как-то отреагируют.

## Описание классов проекта

### Базовые классы

#### `Api`

Класс для отправки HTTP-запросов и получения HTTP-ответов от ресурса, определяемого URI.

Конструктор:

- `constructor(baseUrl: string, options: RequestInit = {})`: принимает базовый URL (тип строка) и глобальные опции для всех запросов, опционально (тип `RequestInit` объект).

```ts
interface RequestInit {
	/** Объект BodyInit или null для установки тела запроса. */
	body?: BodyInit | null;
	/** Строка, указывающая, как запрос будет взаимодействовать с кешем браузера для установки кеша запроса. */
	cache?: RequestCache;
	/** Строка, указывающая, будут ли учетные данные отправляться вместе с запросом всегда, никогда или только при отправке на URL-адрес того же источника. Устанавливает учетные данные запроса. */
	credentials?: RequestCredentials;
	/** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
	headers?: HeadersInit;
	/** Объект Headers, литерал объекта или массив из двух элементов для установки заголовков запроса. */
	integrity?: string;
	/** Логическое значение для установки поддержки активности запроса. */
	keepalive?: boolean;
	/** Строка для установки метода запроса. */
	method?: string;
	/** Строка, указывающая, будет ли запрос использовать CORS или будет ограничен URL-адресами одного и того же происхождения. Устанавливает режим запроса. */
	mode?: RequestMode;
	priority?: RequestPriority;
	/** Строка, указывающая, следует ли запрос за перенаправлениями, приводит ли к ошибке при обнаружении перенаправления или возвращает перенаправление (непрозрачным образом). Устанавливает перенаправление запроса. */
	redirect?: RequestRedirect;
	/** Строка, значением которой является URL-адрес того же источника, «about:client» или пустая строка, чтобы установить реферер запроса. */
	referrer?: string;
	/** Реферальная политика для установки referrerPolicy запроса. */
	referrerPolicy?: ReferrerPolicy;
	/** AbortSignal для установки сигнала запроса. */
	signal?: AbortSignal | null;
	/** Может быть только null. Используется для отключения запроса от любого окна. */
	window?: null;
}
```

Свойства:

- `baseUrl`: базовый `URL` приложения;
- `options`: параметры соединения.

Методы:

- `get`: отправляет запрос `GET` согласно указанному универсальному коду ресурса (`URI`);
- `post`: отправляет запрос `POST` по указанному универсальному коду ресурса (`URI`);
- `handleResponse`: обрабатывает код ответа от сервера, возвращает либо распарсенные данные, либо ошибку.

#### `Components`

Абстрактный класс определяющий создание компонентов пользовательского интерфейса.

Конструктор:

- `constructor(container: HTMLElement)`: принимает контейнер в который будет помещен компонент. Тип контейнера `HTMLElement` -- это базовый класс для всех остальных `HTML`-элементов.

Методы:

- `toggleClass`: переключает класс элемента;
- `setText`: устанавливает текстовое содержимое для элемента;
- `setDisabled`: меняет статус блокировки для элемента;
- `setHidden`: скрывает элемент;
- `setVisible`: отображает элемент;
- `setImage`: устанавливает изображение с альтернативным тестом для элемента;
- `render`: рендерит компонент.

#### `EventEmitter`

Класс для управления подписками на события.

Свойства:

- `_events`: Хеш-таблица `Map<EventName, Set<Subscriber>>` хранящая пару c именем ивента в виде ключа и со списком подписчиков в виде значения.

Методы:

- `on`: устанавливает обработчик для определенного типа событий;
- `off`: снимает установленный обработчик с события;
- `emit`: инициирует событие с данными;
- `onAll`: подписывает на все события;
- `offAll`: сбрасывает все зарегистрированные обработчики для всех событий;
- `trigger`: создаёт коллбэк-триггер, генерирующий событие при вызове.

#### `Model`

Абстрактный класс определяющий конструктор всех моделей приложения.

Конструктор:

- `constructor(data: Partial<T>, protected events: IEvents)`: принимает часть данных дженерика привязанного к интерфейсу либо товара, либо заказа и брокер событий реализующий `IEvents`.

Методы:

- `emitChanges`: сообщает об изменении данных.

### Общие классы

#### `Form`

Класс реализующий компонент отображения формы.

Конструктор:

- `constructor(protected container: HTMLFormElement, protected _events: IEvents)`: принимает контейнер с DOM-элементом формы и брокер событий реализующий `IEvents`.

Свойства:

- `_submit`: элемент кнопки сабмита модального окна;
- `_errors`: контейнер с сообщениями об ошибках.

Методы:

- `valid(value: boolean)`: дизейблит кнопку сабмита формы;
- `errors(value: string)`: меняет содержимое компонента с ошибками;
- `onInputChange(field: keyof T, value: string)`: инициирует событие `${this.container.name}.${String(field)}:change`;
- `render(state: Partial<T> & IFormState)`: рендерит компонент формы.

#### `Modal`

Класс реализующий компонент модального окна.

Конструктор:

- `constructor(container: HTMLElement, protected events: IEvents)`: принимает контейнер с DOM-элементом модального окна (тип `HTMLElement`) и брокер событий реализующий `IEvents`.

Свойства:

- `_closeButton`: элемент кнопки закрытия модального окна;
- `_content`: элемент с содержимым модального окна.

Методы:

- `content(value: HTMLElement)`: устанавливает содержимое окна;
- `open()` - открывает модальное окно, инициирует событие `modal:open`;
- `close()` - закрывает модальное окно, инициирует событие `modal:close`;
- `render(data: IModalData)` - рендерит компонент модального окна.

#### `Success`

Класс определяющий отображение успешного размещения заказа.

Конструктор:

- `constructor(container: HTMLElement, actions: ISuccessActions)`: принимает контейнер с DOM-элементом модального окна (тип `HTMLElement`) и обработчиком события `click` на элементе (тип `ISuccessActions`).

Свойства:

- `_total`: элемент с суммой заказа;
- `_close`: элемент кнопки закрытия окна.

Методы:

- `total(total: string)`: устанавливает сумму заказа.

### Модели данных

#### BasketModel

Класс для хранения данных корзины и работы с ними.

Конструктор:

- `constructor(protected data: Partial<IProduct>, protected events: IEvents`: принимает часть данных дженерика привязанного к интерфейсу товара `IProduct` и брокер событий реализующий интерфейс `IEvents`.

Свойства:

- `items: IProduct[]`: массив позиций с товаром;
- `price: number`: стоимость всей корзины.

Методы:

- `items(item: IProduct[])`: устанавливает значения для массива позиций с товаром в корзине;
- `items()`: забирает список позиций с товаром в корзине;
- `isInBasket(item: IProduct)`: проверяет наличие позиции с товаром в корзине;
- `addToBasket(item: IProduct)`: добавляет позицию с товаром в корзину, инициирует событие `basket:change`;
- `deleteFromBasket(item: IProduct)`: удаляет позицию с товаром из корзины, инициирует событие `basket:change`;
- `clearBasket()`: очищает корзину, инициирует событие `basket:change`.

#### CatalogModel

Класс для хранения данных каталога с товарами и работы с ним.

Конструктор:

- `constructor(protected data: Partial<IProduct>, protected events: IEvents)`: принимает часть данных дженерика привязанного к интерфейсу товара `IProduct` и брокер событий реализующий интерфейс `IEvents`.

Свойства:

- `_items: IProduct[]`: массив позиций с товаром;
- `selectedItem: IProduct`: .

Методы:

- `items(items: IProduct[])`: устанавливает значения для массива позиций с товаром, инициирует событие `items:change`;
- `items()`: забирает массив позиций с товаром;
- `preview(item: IProduct)`: устанавливает значения для товара, инициирует событие `preview:change`.

#### OrderModel

Класс для хранения данных заказа и работы с ними.

Конструктор:

- `constructor(protected data: Partial<IOrder>, protected events: IEvents)`: принимает часть данных дженерика привязанного к интерфейсу заказа `IOrder` и брокер событий реализующий интерфейс `IEvents`.

Свойства:

- `order: IOrder`: данные заказа;
- `formErrors: TFormErrors`: данные валидации форм.

Методы:

- `setOrderAddress(field: keyof TOrderForm, value: string)`: устанавливает данные заказа (адрес);
- `validateOrderAddressAndPayment()`: проверяет корректность заполнения полей адрес и метод оплаты;
- `setOrderContacts(field: keyof TContactForm, value: string)`: устанавливает данные заказа (email и номер телефона);
- `validateContacts()`: проверяет корректность заполнения полей email и номер телефона.

### Компоненты

#### Basket

Класс реализующий корзину.

Конструктор:

- `constructor(readonly container: HTMLElement, protected events: EventEmitter)`: принимает контейнер с DOM-элементом модального окна (тип `HTMLElement`) и брокер событий реализующий интерфейс `EventEmitter`.

Свойства:

- `_list`: элемент содержимого корзины;
- `_price`: элемент суммы товаров в корзине;
- `_button`: элемент кнопки в корзине.

Методы:

- `items(items: HTMLElement[])`: выставляет содержимое в корзине;
- `price(price: number)`: выставляет значение суммы товаров в корзине;
- `setIndexes()`: отрисовывает индексы позиций товара в корзине;
- `toggleButton(state: boolean)`: меняет состояние кнопки в корзине.

#### Card

Класс реализующий карточку товара.

Конструктор:

- `constructor(readonly container: HTMLElement, actions?: IActions)`: принимает контейнер с DOM-элементом модального окна (тип `HTMLElement`) и обработчиком события `click` на элементе (тип `IActions`).

Свойства:

- `_title`: элемент заголовка товара;
- `_image`: элемент картинки товара;
- `_price`: элемент цены товара;
- `_category`: элемент категории товара;
- `_description`: элемент описания товара;
- `_button`: элемент кнопки карточки с товаром.

Методы:

- `id(value: string)`: устанавливает идентификатор товара;
- `id()`: забирает идентификатор товара;
- `title(value: string)`: устанавливает заголовок товара;
- `title()`: забирает заголовок товара;
- `description(value: string)`: устанавливает описание товара;
- `button(value: string)`: устанавливает текст на кнопке на карточке товара;
- `price(value: string)`: устанавливает цену товара;
- `price()`: забирает цену товара;
- `category(value: string)`: устанавливает категорию товара;
- `category()`: забирает категорию товара;
- `image(src: string)`: устанавливает изображение товара.

#### Order

Класс реализующий форму заказа.

Конструктор:

- `constructor(container: HTMLFormElement, events: IEvents)`: принимает контейнер с формой (тип `HTMLFormElement`) и брокер событий реализующий `IEvents`.

Свойства:

- `_paymentButtons`: элемент кнопки выбора метода оплаты;
- `_button`: элемент кнопки сабмита.

Методы:

- `payment(value: string)`: меняет метод оплаты;
- `address(value: string)`: меняет содержимое поля `address` в форме;
- `email(value: string)`: меняет содержимое поля `email` в форме;
- `phone(value: string)`: меняет содержимое поля `phone` в форме;
- `onPaymentMethodSelect`: выставляет метод оплаты, инициирует событие `order:payment:change`.

#### Page

Класс реализующий главную страницу приложения.

Конструктор:

- `constructor(container: HTMLElement, protected events: IEvents)`: принимает контейнер с телом документа (тип `HTMLElement`) и брокер событий реализующий `IEvents`.

Свойства:

- `_counter`: элемент счетчика корзины на странице;
- `_catalog`: элемент каталога на странице;
- `_wrapper`: элемент обертки главной страницы;
- `_basket`: элемент корзины на странице.

Методы:

- `counter(value: number)`: меняет счетчик;
- `catalog(items: HTMLElement[])`: меняет каталог;
- `locked(value: boolean)`: меняет класс обертки главной страницы.

### Компоненты коммуникации

#### MagazinusApi

Специальный компонент для взаимодействия с `API` магазина.

Конструктор:

- `constructor(cdn: string, baseUrl: string, options?: RequestInit)`: принимает `URL` до контента (тип строка), базовый `URL` (тип строка) и глобальные опции для всех запросов, опционально (тип `RequestInit`).

Свойства:

- `cdn`: `URL` до контента (содержимое каталога).

Методы:

- `getProductList(): Promise<IProduct[]>`: получение списка товаров;
- `placeOrder(order: IOrder): Promise<IOrderResult>`: размещение заказа.

### Интерфейсы и типы данных

Интерфейс описания товара

```ts
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	selected: boolean;
}
```

Тип метода оплаты

```ts
type PaymentMethodTuple = typeof PAYMENT_METHOD;
export type PaymentMethod = PaymentMethodTuple[number];
```

Интерфейс описания заказа

```ts
export interface IOrder {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}
```

Интерфейс содержимого карточки товара корзины

```ts
export interface ICard extends IProduct {
	index: string;
	button: string;
}
```

Тип поля с формы заказа

```ts
export type TOrderForm = Pick<IOrder, 'payment' | 'address'>;
```

Тип поля с формы контактов

```ts
export type TContactForm = Pick<IOrder, 'email' | 'phone'>;
```

Интрефейс результата заказа

```ts
export interface IOrderResult {
	id: string;
	total: number;
}
```

Тип ошибок формы

```ts
export type TFormErrors = Partial<Record<keyof IOrder, string>>;
```

Тип со списоком ответов на запросы по API

```ts
export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};
```

Тип с набором HTTP методов

```ts
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
```

Интерфейс события по клику

```ts
export interface IActions {
	onClick: (event: MouseEvent) => void;
}
```

Интерфейс работы с событиями (установка/снятие слушателей, вызов слушателя)

```ts
export interface IEvents {
	on<T extends object>(event: string, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

Интерфейс методов взаимодействия с API магазина

```ts
export interface IMagazinusApi {
	getProductList: () => Promise<IProduct[]>;
	placeOrder: (order: IOrder) => Promise<IOrderResult>;
}
```

Интерфейс с общими полями и методами для работы с корзиной

```ts
export interface IBasketModel {
	items: IProduct[];
	price: number;
	isInBasket: (item: IProduct) => boolean;
	addToBasket: (item: IProduct) => void;
	deleteFromBasket: (item: IProduct) => void;
	clearBasket: () => void;
}
```

Интерфейс с общими полями и методами для работы с каталогом

```ts
export interface ICatalogModel {
	items: IProduct[];
	selectedItem: IProduct;
	preview: IProduct;
}
```

Интерфейс с общими полями и методами для работы с заказом

```ts
export interface IOrderModel {
	order: IOrder;
	formErrors: TFormErrors;
	setOrderAddress: (field: keyof TOrderForm, value: string) => void;
	validateOrderAddressAndPayment: () => boolean;
	setOrderContacts: (field: keyof TContactForm, value: string) => void;
	validateContacts: () => boolean;
}
```

Интерфейс состояния формы

```ts
export interface IFormState {
	valid: boolean;
	errors: string[];
}
```

Интерфейс контента модального окна

```ts
export interface IModalData {
	content: HTMLElement;
}
```

Интерфейс общей стоимости заказа

```ts
export interface ISuccess {
	total: number;
}
```

Интрейфес события по клику

```ts
export interface ISuccessActions {
	onClick: () => void;
}
```

Интрефейс отображения корзины

```ts
export interface IBasketView {
	items: HTMLElement[];
	price: number;
	setIndexes(): void;
	toggleButton(state: boolean): void;
}
```

Интерфейс формы заказа

```ts
export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
	onPaymentMethodSelect: (name: string) => void;
}
```

Интрефейс отображения главной страницы

```ts
export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}
```

Перечисление с событиями магазина

```ts
export enum Events {
	ITEMS_CHANGE = 'items:change', //отобразить содержимое каточки с товарами
	CARD_SELECT = 'card:select', //показать превью карточки товара
	PREVIEW_CHANGE = 'preview:change', //скастоваться на изменения в модалке с карточкой товара
	BASKET_CHANGE = 'basket:change', //скастоваться на изменения в корзине
	BASKET_OPEN = 'basket:open', //открыть содержимое корзины
	ORDER_OPEN = 'order:open', //открыть форму заказа
	ORDER_SUBMIT = 'order:submit', //открыть форму контактов
	FORM_ERRORS_ADRESS = 'formErrors:address', //Изменилось состояние валидации формы
	FORM_ERRORS_CONTACTS = 'formErrors:contacts', //Изменилось состояние валидации формы
	ORDER_PAYMENT_CHANGE = 'order:payment:change', //Изменился способ оплаты
	CONTACTS_SUBMIT = 'contacts:submit', //Размещение заказа
	MODAL_OPEN = 'modal:open', //Открытие модального окна
	MODAL_CLOSE = 'modal:close', //Закрытие модального окна
}
```
