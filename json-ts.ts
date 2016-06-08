/** A Typescript implementation of a JSON parser
 *
 */

type SCALAR_TYPE = boolean|number|string;
type ARRAY_TYPE = boolean[]|number[]|string[];
type HT_TYPE = {[key: string]: any};

/** Json parser class
 *
 *  Stringify and parse json structures.
 */
export class JSON_TS {

  protected static current_index = 0;
  protected static current_char = "";
  protected static json_str = null;

  /****************************************** STRINGIFY *******************************************/

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
        result += ',' + this.stringify(json_obj[i]);
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

  /******************************************** PARSE *********************************************/

  protected static error(msg: string): void {
    throw {
      name: "SyntaxError",
      message: msg,
      at: this.current_index,
      text: this.json_str
    };
  }

  protected static next(char: string = ''): string {
    if (char && (char !== this.current_char)) {
      this.error("Expected '" + char + "' instead of '" + this.current_char + "'");
    }
    this.current_char = this.json_str.charAt(this.current_index++);
    return this.current_char;
  }

  protected static white(): void {
    while (this.current_char && (this.current_char <= " ")) {
      this.next();
    }
  }

  protected static parse_word(): boolean {
    switch (this.current_char) {
      case "t":
        this.next("t");
        this.next("r");
        this.next("u");
        this.next("e");
        return true;
      case "f":
        this.next("f");
        this.next("a");
        this.next("l");
        this.next("s");
        this.next("e");
        return false;
      case "n":
        this.next("n");
        this.next("u");
        this.next("l");
        this.next("l");
        return null;
      default:
        this.error("Unexpected '" + this.current_char + "'");
    }
  }

  protected static parse_number(): number {
    let value;
    let result = "";

    if (this.current_char === "-") {
      result = "-";
      this.next("-");
    }
    while ((this.current_char >= "0") && (this.current_char <= "9")) {
      result += this.current_char;
      this.next();
    }
    if (this.current_char === ".") {
      result += ".";
      while (this.next() && (this.current_char >= "0") && (this.current_char <= "9")) {
          result += this.current_char;
      }
    }
    if ((this.current_char === "e") || (this.current_char === "E")) {
      result += this.current_char;
      this.next();
      if ((this.current_char === "-") || (this.current_char === "+")) {
        result += this.current_char;
        this.next();
      }
      while ((this.current_char >= "0") && (this.current_char <= "9")) {
        result += this.current_char;
        this.next();
      }
    }
    value = +result;
    if (!isFinite(value)) {
      this.error("Bad number");
    }
    return value;
  }

  protected static parse_string(): string {
    let result = "";
    if (this.current_char === "\"") {
      while (this.next()) {
        if (this.current_char === "\"") {
          this.next();
          return result;
        }
        if (this.current_char === "\\") {
          this.next();
          if (this.current_char === "\"") {
            result += "\"";
          }
          else {
            break;
          }
        }
        else {
          result += this.current_char;
        }
      }
    }
    this.error("Bad string");
  }

  protected static parse_array() {
    var result = [];
    if (this.current_char === "[") {
      this.next("[");
      this.white();
      if (this.current_char === "]") {
        this.next("]");
        return result;
      }
      while (this.current_char) {
        result.push(this.parse_value());
        this.white();
        if (this.current_char === "]") {
          this.next("]");
          return result;
        }
        this.next(",");
        this.white();
      }
    }
    this.error("Bad array");
  }

  protected static parse_object() {
    var key;
    var result = {};
    if (this.current_char === "{") {
      this.next("{");
      this.white();
      if (this.current_char === "}") {
        this.next("}");
        return result;
      }
      while (this.current_char) {
        key = this.parse_string();
        this.white();
        this.next(":");
        if (key in result) {
          this.error("Duplicate key '" + key + "'");
        }
        result[key] = this.parse_value();
        this.white();
        if (this.current_char === "}") {
          this.next("}");
          return result;
        }
        this.next(",");
        this.white();
      }
    }
    this.error("Bad object");
  }

  protected static parse_value() {
    this.white();
    switch (this.current_char) {
      case "{":
        return this.parse_object();
      case "[":
        return this.parse_array();
      case "\"":
        return this.parse_string();
      case "-":
        return this.parse_number();
      default:
        return (this.current_char >= "0" && this.current_char <= "9")
          ? this.parse_number() : this.parse_word();
    }
  }

  static parse(json_str: string): any {
    let result;
    this.current_index = 0;
    this.current_char = " ";
    this.json_str = json_str;
    result = this.parse_value();
    this.white();
    if (this.current_char) {
      console.log("Error at the end, remains characters: " + this.current_char);
      this.error("Syntax error");
    }
    return result;
  }
}

// /*FIXME TO REMOVE!!! */
// class old_parser {
//   protected static current_index;
//
//   protected static parse_scl_bool(json_str: string): boolean {
//     if ((json_str.charAt(this.current_index + 1) === 'r') &&
//         (json_str.charAt(this.current_index + 2) === 'u') &&
//         (json_str.charAt(this.current_index + 3) === 'e')) {
//       this.current_index += 3;
//       return true;
//     }
//     else if ((json_str.charAt(this.current_index + 1) === 'a') &&
//              (json_str.charAt(this.current_index + 2) === 'l') &&
//              (json_str.charAt(this.current_index + 3) === 's') &&
//              (json_str.charAt(this.current_index + 4) === 'e')) {
//       this.current_index += 4;
//       return false;
//     }
//   }
//   protected static parse_scl_number(json_str: string): number {
//     let last_index = this.current_index;
//     let current_char;
//     do {
//       current_char = json_str.charAt(++this.current_index);
//     } while (current_char && (((current_char >= '0') && (current_char <= '9')) ||
//                                (current_char === '.')));
//     return +json_str.slice(last_index, this.current_index);
//   }
//   protected static parse_scl_str(json_str: string): string {
//     let last_index = this.current_index + 1;
//     let current_char;
//     do {
//       current_char = json_str.charAt(++this.current_index);
//     } while (current_char && (current_char !== '"'));
//     return json_str.slice(last_index, this.current_index);
//   }
//
//   protected static parse_scl(json_str: string): SCALAR_TYPE {
//     let current_char = json_str.charAt(this.current_index);
//     let value;
//     if ((current_char === 't') || (current_char === 'f')) {
//       value = this.parse_scl_bool(json_str);
//     }
//     else if (current_char === '"') {
//       value = this.parse_scl_str(json_str);
//     }
//     else {
//       value = this.parse_scl_number(json_str);
//     }
//     return value;
//   }
//
//   protected static parse_arr(json_str: string): ARRAY_TYPE {
//     let value = [];
//     let current_char = json_str.charAt(++this.current_index);
//     while (current_char && (current_char !== ']')) {
//       value.push(this.parse_scl(json_str));
//       current_char = json_str.charAt(++this.current_index);
//       if (current_char === ',') {
//         current_char = json_str.charAt(++this.current_index);
//       }
//     }
//     return value;
//   }
//
//   protected static parse_obj(json_str: string): HT_TYPE {
//     let value = {};
//     let current_char = json_str.charAt(++this.current_index);
//     while (current_char && (current_char !== '}')) {
//       let key = this.parse_scl_str(json_str);
//       let val;
//       current_char = json_str.charAt(++this.current_index);
//       if (current_char === ':') { /* FIXME: authorize no ':'? */
//         val = this.parse_scl(json_str);
//         current_char = json_str.charAt(++this.current_index);
//       }
//       if (current_char === ',') {
//         current_char = json_str.charAt(++this.current_index);
//       }
//     }
//     return value;
//   }
//
//   static parse_wrapper(json_str: string): any {
//     let result = null;
//     let current_char = json_str.charAt(this.current_index);
//     while (current_char) {
//       if (current_char === '{') {
//         result = this.parse_obj(json_str);
//       }
//       else if (current_char === '[') {
//         result = this.parse_arr(json_str);
//       }
//       else {
//         result = this.parse_scl(json_str);
//       }
//       current_char = json_str.charAt(++this.current_index);
//       if (current_char === ',') {
//         current_char = json_str.charAt(++this.current_index);
//       }
//     }
//     return result;
//   }
//
//   static parse(json_str): any {
//     this.current_index = 0;
//     return this.parse_wrapper(json_str);;
//   }
// }
