import Field from './field';
import { find, createError } from '../utils';

// @flow

export default class FieldBag {
  items: Array<Field>;
  itemsById: Object;

  constructor (items = []) {
    this.items = items || [];
    this.itemsById = this.items.reduce((itemsById, item) => {
      itemsById[item.id] = item;
      return itemsById;
    }, {});
  }

  [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator'] () {
    let index = 0;
    return {
      next: () => {
        return { value: this.items[index++], done: index > this.items.length };
      }
    };
  }

  /**
   * Gets the current items length.
   */

  get length (): number {
    return this.items.length;
  }

  /**
   * Finds the first field that matches the provided matcher object.
   */
  find (matcher: Object): ?Field {
    return find(this.items, item => item.matches(matcher));
  }

  /**
   * Finds the field with the given id, using a plain object as a map to link
   * ids to items faster than by looping over the array and matching.
   */
  findById (id: String): ?Field {
    return this.itemsById[id] || null;
  }

  /**
   * Filters the items down to the matched fields.
   */
  filter (matcher: Object | Array<any>): Array<Field> {
    // multiple matchers to be tried.
    if (Array.isArray(matcher)) {
      return this.items.filter(item => matcher.some(m => item.matches(m)));
    }

    return this.items.filter(item => item.matches(matcher));
  }

  /**
   * Maps the field items using the mapping function.
   */
  map (mapper: (f: Field) => any): Array<Field> {
    return this.items.map(mapper);
  }

  /**
   * Finds and removes the first field that matches the provided matcher object, returns the removed item.
   */
  remove (matcher: Object | Field): Field | null {
    let item = null;
    if (matcher instanceof Field) {
      item = matcher;
    } else {
      item = this.find(matcher);
    }

    if (!item) return null;

    const index = this.items.indexOf(item);
    this.items.splice(index, 1);
    delete this.itemsById[item.id];

    return item;
  }

  /**
   * Adds a field item to the list.
   */
  push (item: ?Field) {
    if (! (item instanceof Field)) {
      throw createError('FieldBag only accepts instances of Field that has an id defined.');
    }

    if (!item.id) {
      throw createError('Field id must be defined.');
    }

    if (this.findById(item.id)) {
      throw createError(`Field with id ${item.id} is already added.`);
    }

    this.items.push(item);
    this.itemsById[item.id] = item;
  }
}