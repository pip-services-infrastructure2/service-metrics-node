"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeHorizonConverter = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const TimeHorizonV1_1 = require("../data/version1/TimeHorizonV1");
class TimeHorizonConverter {
    static fromString(value) {
        if (value == null || value == '')
            return TimeHorizonV1_1.TimeHorizonV1.Total;
        value = value.toLowerCase();
        if (value == "total")
            return TimeHorizonV1_1.TimeHorizonV1.Total;
        if (value == "year" || value == "yearly")
            return TimeHorizonV1_1.TimeHorizonV1.Year;
        if (value == "month" || value == "monthly")
            return TimeHorizonV1_1.TimeHorizonV1.Month;
        if (value == "day" || value == "daily")
            return TimeHorizonV1_1.TimeHorizonV1.Day;
        if (value == "hour" || value == "hourly")
            return TimeHorizonV1_1.TimeHorizonV1.Hour;
        let code = pip_services3_commons_nodex_1.IntegerConverter.toIntegerWithDefault(value, TimeHorizonV1_1.TimeHorizonV1.Total);
        return code;
    }
}
exports.TimeHorizonConverter = TimeHorizonConverter;
//# sourceMappingURL=TimeHorizonConverter.js.map