/*
The MIT License (MIT)

Copyright (c) 2016 Charles Aracil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/** A Typescript implementation of a JSON parser
 *
 *  Repository can be found at https://github.com/CharlesAracil/json-typescript.
 *  Some of the code is based on the javascript implementation json.js, which can be found at
 *  https://github.com/douglascrockford/JSON-js.
 *
 */

type HT_TYPE = {[key: string]: any};

/** Json parser class
 *
 *  Stringify and parse json structures.
 *
 *  Both stringify and parse methods throw an SyntaxError exception if they
 *  receive an invalid structure.
 */
export class JSON_TS {

  protected static current_index = 0;
  protected static current_char = "";
  protected static json_str = null;

  /****************************************** STRINGIFY *******************************************/

  protected static enclose(open: string, input: string, close: string): string {
    return open + input + close;
  }

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

  /** Stringify a json object
   *
   *  @param json_obj the json structure
   *
   *  @return a string containing the serialized json
   */
  public static stringify(json_obj: HT_TYPE): string {
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
        result += this.enclose("\"", json_obj.replace(/\"/g, "\\\""), "\"");
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

  protected static parse_array(): any[] {
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

  protected static parse_object(): any {
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

  protected static parse_value(): any {
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

  /** Parse a serialized json structure
   *
   *  @param json_str the serialized json
   *
   *  @return the structured json object
   */
  public static parse(json_str: string): any {
    let result;
    this.current_index = 0;
    this.current_char = " ";
    this.json_str = json_str;
    result = this.parse_value();
    this.white();
    if (this.current_char) {
      this.error("Syntax error");
    }
    return result;
  }
}
