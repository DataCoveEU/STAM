import { Config, QueryObject } from "./index";

/**
 * Used for creating a link from a QueryObject
 */
export class QueryGenerator {
  queryObject: QueryObject;
  config: Config;
  constructor(query: QueryObject, config: Config) {
    this.config = config;
    this.queryObject = query;
  }

  /**
   * Returns a string for a sensorthings server query
   * @param main defaults to true, used for specifying if the queries should be appended to the end or added inside the brackets
   * @returns link prefix
   */
  toString(main: Boolean = true) {
    var url: String = this.queryObject.entityType;
    var prefix: Array<String> = [];
  
    // Adding id if present
    if (this.queryObject.id) {
      if (main) {
        url = `${url}(${this.queryObject.id})`
        delete this.queryObject.id;
      } else {
        //If not in main, no other attributes can be added
        return `${this.queryObject.entityType}(${this.queryObject.id})`
      }
    }

    if (this.queryObject.pathSuffix) {
      url = `${url}/${this.queryObject.pathSuffix}`;
    }


    for (var key in this.queryObject) {
      //Remove empty properties
      if ((!this.queryObject[key]) && this.queryObject[key] != 0) continue;
      //Select
      if (key == 'select') {
        prefix.push(`$select=${this.queryObject.select.join(',')}`);
        continue;
      }
      //Expand
      if (key == 'expand') {
        prefix.push(`$expand=${this.queryObject.expand.map<String>((queryObject) => {
          return new QueryGenerator(queryObject,this.config).toString(false);
        }).join(',')}`);
        continue;
      }
      //Every other property
      if (key != 'entityType' && key != 'pathSuffix') {
        prefix.push(`$${key}=${this.queryObject[key].toString()}`)
      }
    }

    if(main && this.config.queryParameters){
      prefix.push(...Object.entries(this.config.queryParameters).map<String>(e => `${e[0]}=${e[1]}`));
    }

    //Check if a prefix is present
    if (prefix.length == 0) {
      return url;
    }

    //Return right url string
    if (main) {
      return `${url}?${prefix.join('&')}`;
    } else {
      return `${url}(${prefix.join(';')})`;
    }
  }
}