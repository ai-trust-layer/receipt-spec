import Ajv from "ajv";
import addFormats from "ajv-formats";

window.Ajv7 = Ajv;           // compat cu codul existent care așteaptă Ajv7 global
window.addAjvFormats = addFormats;
