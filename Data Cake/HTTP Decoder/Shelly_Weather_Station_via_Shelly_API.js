function Decoder(request) {
    /******************************************************************
     * CONFIG
     *
     * DATACAKE_DEVICE:
     *   Device đích trong Datacake (Device Serial Number)
     *
     * WEATHER_MAP:
     *   Map Shelly device.id -> PREFIX field trong Datacake
     *
     * Ví dụ:
     *   "XB277409423461221": "WEATHER_STATION"
     * sẽ sinh ra các field:
     *   WEATHER_STATION_TEMPERATURE
     *   WEATHER_STATION_HUMIDITY
     *   WEATHER_STATION_DEWPOINT
     *   ...
     ******************************************************************/
    var DATACAKE_DEVICE = "YOUR_DATACAKE_DEVICE_SERIAL_NUMBER";

    var WEATHER_MAP = {
        "Shelly_Device_ID": "WEATHER_STATION"
    };

    // ==========================================================
    // HELPERS
    // ==========================================================
    function parseBody(req) {
        if (!req) return null;

        if (typeof req.body === "string") {
            try {
                return JSON.parse(req.body);
            } catch (e) {
                return null;
            }
        }

        if (req.body && typeof req.body === "object") {
            return req.body;
        }

        // fallback nếu Datacake truyền object trực tiếp
        if (typeof req === "object") {
            return req;
        }

        return null;
    }

    function asArray(input) {
        if (Array.isArray(input)) return input;
        if (input && Array.isArray(input.devices)) return input.devices;
        if (input && Array.isArray(input.data)) return input.data;
        if (input && Array.isArray(input.results)) return input.results;
        if (input && typeof input === "object") return [input];
        return [];
    }

    function isWeatherStation(dev) {
        if (!dev || typeof dev !== "object") return false;

        var raw = dev.raw || {};

        if (dev.code === "SBWS-90CM") return true;

        return !!(
            raw["temperature:0"] &&
            raw["humidity:0"] &&
            raw["pressure:0"] &&
            raw["speed:0"] &&
            raw["direction:0"]
        );
    }

    function get(obj, path, fallback) {
        try {
            var cur = obj;
            for (var i = 0; i < path.length; i++) {
                if (cur == null) return fallback;
                cur = cur[path[i]];
            }
            return cur == null ? fallback : cur;
        } catch (e) {
            return fallback;
        }
    }

    function toNumber(v) {
        if (v === null || v === undefined || v === "") return null;
        var n = Number(v);
        return isFinite(n) ? n : null;
    }

    function pushField(arr, field, value) {
        var num = toNumber(value);
        if (num === null) return;

        arr.push({
            device: DATACAKE_DEVICE,
            field: field,
            value: num
        });
    }

    // ==========================================================
    // INPUT
    // ==========================================================
    var payload = parseBody(request);
    if (!payload) return [];

    var devices = asArray(payload);
    if (!devices.length) return [];

    // ==========================================================
    // PROCESS
    // ==========================================================
    var result = [];

    for (var i = 0; i < devices.length; i++) {
        var dev = devices[i] || {};
        var devId = String(dev.id || "");
        var prefix = WEATHER_MAP[devId];

        // chỉ xử lý các device đã khai báo trong WEATHER_MAP
        if (!prefix) continue;

        if (!isWeatherStation(dev)) continue;

        var raw = dev.raw || {};

        pushField(result, prefix + "_TEMPERATURE",    get(raw, ["temperature:0", "tC"], null));
        pushField(result, prefix + "_HUMIDITY",       get(raw, ["humidity:0", "rh"], null));
        pushField(result, prefix + "_DEWPOINT",       get(raw, ["dewpoint:0", "value"], null));
        pushField(result, prefix + "_PRESSURE",       get(raw, ["pressure:0", "value"], null));
        pushField(result, prefix + "_WIND_SPEED",     get(raw, ["speed:0", "value"], null));
        pushField(result, prefix + "_WIND_GUST",      get(raw, ["speed:1", "value"], null));
        pushField(result, prefix + "_WIND_DIRECTION", get(raw, ["direction:0", "value"], null));
        pushField(result, prefix + "_ILLUMINANCE",    get(raw, ["illuminance:0", "lux"], null));

        // hỗ trợ cả UV:0 và uv:0 nếu payload thực tế khác nhau
        var uvValue = get(raw, ["UV:0", "value"], null);
        if (uvValue === null) {
            uvValue = get(raw, ["uv:0", "value"], null);
        }
        pushField(result, prefix + "_UV", uvValue);

        pushField(result, prefix + "_PRECIPITATION",  get(raw, ["precipitation:0", "value"], null));
    }

    return result;
}
