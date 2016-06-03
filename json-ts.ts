/** A Typescript implementation of a JSON parser
 *
 */

type HT_TYPE = {[key: string]: any};

/**
 *
 */
export class JSON_TS {
  /**
   *
   */
  protected static enclose(open: string, input: string, close: string): string {
    return open + input + close;
  }

  /**
   *
   */
  protected static stringify_array(json_obj: any[]): string {
    let result = "";
    if (json_obj.length) {
      result += this.stringify(json_obj[0]);
      for (let i = 1; i < json_obj.length; i++) {
        result += "," + this.stringify(json_obj[i]);
      }
    }
    return result;
  }

  /**
   *
   */
  protected static stringify_object(json_obj: HT_TYPE): string {
    let need_comma = false;
    let result = "";
    for (let key in json_obj) {
      if (need_comma) {
        result += ",";
        need_comma = false;
      }
      result += this.enclose("\"", key , "\":") + this.stringify(json_obj[key]);
      need_comma = true;
    }
    return result;
  }

  /**
   *
   */
  static stringify(json_obj: HT_TYPE): string {
    let result = "";
    if (json_obj instanceof Array) {
      result += this.enclose("[", this.stringify_array(json_obj), "]");
    }
    else if (typeof json_obj === 'object') {
      result += this.enclose("{", this.stringify_object(json_obj), "}");
    }
    else {
      if (typeof json_obj === 'boolean') {
        result += json_obj ? "true" : "false";
      }
      else if (typeof json_obj === 'string') {
        result += this.enclose("\"", json_obj, "\"");
      }
      else {
        result += json_obj;
      }
    }
    return result;
  }

  /**
   *
   */
  static parse(json_str: string): HT_TYPE {
    return {
      recipe: "Stuff with chocolate",
      ingredients: ["peper", "vinegar", "chocolate"],
      time: 4,
      procedure: {
        1: "do stuff",
        "2": "cook stuff",
        3.0: "Wait a hell of a long time!",
        4.2: "taste stuff",
        "10.0": "Sleep"
      },
      tasty: true
    };
  }
}
