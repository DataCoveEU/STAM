import { QueryObject } from "./index";

export class QueryGenerator {
  queryObject: QueryObject;
  constructor(query: QueryObject) {
    this.queryObject = query;
  }

  toString(main: Boolean = true) {
    var url: String = this.queryObject.entityType;
    var prefix: Array<String> = [];

    if (this.queryObject.id) {
      return `${this.queryObject.entityType}(${this.queryObject.id})`
    }


    for (var key in this.queryObject) {
      if (!this.queryObject[key]) continue;
      if (key == 'select') {
        prefix.push(`$select=${this.queryObject.select.join(',')}`);
        continue;
      }
      if (key == 'expand') {
        prefix.push(`$expand=${this.queryObject.expand.map<String>((queryObject) => {
          return new QueryGenerator(queryObject).toString(false);
        }).join(',')}`);
        continue;
      }
      if (key != 'entityType') {
        prefix.push(`$${key}=${this.queryObject[key].toString()}`)
      }

    }

    if (prefix.length == 0) {
      return url;
    }

    if (main) {
      return `${url}?${prefix.map(encodeURI).join('&')}`;
    } else {
      return `${url}(${prefix.map(encodeURI).join(',')})`;
    }
  }
}