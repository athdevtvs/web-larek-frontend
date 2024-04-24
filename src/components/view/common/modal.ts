import { Component } from '../../base/component';
import { IModalData } from '../../../types';
import { IEvents } from '../../base/events';
import { ensureElement } from '../../../utils/utils';

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected _events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this._events.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this._events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
