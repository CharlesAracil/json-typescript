 /** Test resources
  *
  */

import {JSON_TS} from "./json-ts";

type HT_TYPE = {[key: string]: any};  /* type alias export not supported yet */

/******************************************************************************/
/********************************** HELPERS ***********************************/
/******************************************************************************/

/** Log utils
 *
 */
class Log {
  protected static echo(prefix: string, message: string) {
    console.log(prefix + " " + message)
  }
  static info(message: string) {
    this.echo("[?]", message);
  }
  static warning(message: string) {
    this.echo("[!]", message);
  }
  static error(message: string) {
    this.echo("[X]", message);
  }
  static debug(message: string) {
    this.echo("[D]", message);
  }
}

/** Pad to 2 digits with a leading-zero if necessary
 *
 *  Work only for value inferior than 100.
 */
function padding_2d(input: number) {
  let result = (input < 10) ? "0" + input : "" + input;
  return result;
}

/** Compare two json structures
 *
 *  @return true if all fields are identical, and they have exactly the same,
 *  false otherwise
 *
 *  @note: a stringify to compare implies order-dependancy!
 */
function json_are_equal(json_a: HT_TYPE, json_b: HT_TYPE): boolean {
  return (JSON.stringify(json_a) === JSON.stringify(json_b));
}

/******************************************************************************/
/************************************ MAIN ************************************/
/******************************************************************************/

/** An array of JSON-compliant structures
 *
 *  Will be iterated over to test JSON transformations.
 */
let json_list: HT_TYPE[] = [
  {},
  [],
  ["bunny", "carot"],
  "Giberjab",
  7,
  3.14,
  true,
  {
    2: "yellow"
  },
  {
    "hola": "quetzal"
  },
  {
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
  },
  {
    id: 1,
    title: "A road to BlackALand",
    price: 12.50,
    available: true,
    tags: ["green", "culture"],
    owner: {
      id: {
        name: "Bob",
        surname: "The mighty mike"
      },
      address: "21th happy street",
      telephone: "0123456789"
    }}
];


for (let ijson in json_list) {
  let json = json_list[ijson]
  Log.info("---------- Test case " + padding_2d(+ijson) + " ----------");
  Log.info("Input: " + JSON.stringify(json))
  // test stringify
  let lib_resp = JSON_TS.stringify(json);
  let builtin_resp = JSON.stringify(json);
  if (lib_resp === builtin_resp) {
    Log.info("Stringify: OK");
  }
  else {
    Log.error("Stringify: KO");
    Log.error("lib:     " + lib_resp);
    Log.error("builtin: " + builtin_resp);
  }
  // parse the string back
  let json_obj_lib = JSON_TS.parse(lib_resp);
  let json_obj_builtin = JSON.parse(lib_resp);
  if (json_are_equal(json_obj_lib, json_obj_builtin)) {
    Log.info("Parse: OK");
  }
  else {
    Log.error("Parse: KO");
    Log.error("lib:     " + JSON.stringify(json_obj_lib));
    Log.error("builtin: " + JSON.stringify(json_obj_builtin));
  }
}
