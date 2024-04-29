import { Model } from '../base/model';
import { ICatalogModel, IProduct, Events } from '../../types';
import { IEvents } from '../base/events';

export class CatalogModel extends Model<IProduct> implements ICatalogModel {
	protected _items: IProduct[];
	selectedItem: IProduct;

	constructor(protected data: Partial<IProduct>, protected events: IEvents) {
		super({}, events);
		this._items = [];
	}

	set items(items: IProduct[]) {
		this._items = items;
		this.emitChanges(Events.ITEMS_CHANGE, this._items);
	}

	get items() {
		return this._items;
	}

	set preview(item: IProduct) {
		this.selectedItem = item;
		this.emitChanges(Events.PREVIEW_CHANGE, item);
	}
}
