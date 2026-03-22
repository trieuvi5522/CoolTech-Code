function Decoder(request) {
//Config Here
    var DATACAKE_DEVICE = "<Devie Serial Number>";

//Field Structure <Device Name>_<Type>
    var ID_TO_NAME = {
        "<Shelly Device ID>": "<Device Name>", 
        "<Shelly Device ID>": "<Device Name>" 
    };
//End Config
    function normalizeDeviceName(name) {
        if (!name) return "UNKNOWN";

        var s = String(name).trim();

        var charMap = {
            "æ": "AE", "Æ": "AE",
            "ø": "O",  "Ø": "O",
            "å": "A",  "Å": "A",
            "ä": "A",  "Ä": "A",
            "ö": "O",  "Ö": "O",
            "ü": "U",  "Ü": "U"
        };

        s = s.split("").map(function (ch) {
            return charMap[ch] || ch;
        }).join("");

        if (s.normalize) {
            s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        s = s.toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .replace(/_+/g, "_");

        return s || "UNKNOWN";
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

        return null;
    }

    var payload = parseBody(request);
    if (!payload) return [];

    var devices = Array.isArray(payload.devices) ? payload.devices : [];
    var result = [];

    for (var i = 0; i < devices.length; i++) {
        var dev = devices[i] || {};
        var shellyId = String(dev.id || "");
        var configuredName = ID_TO_NAME[shellyId];

        // Chỉ xử lý những Shelly ID đã khai báo trong map
        if (!configuredName) continue;

        var raw = dev.raw || {};
        var instant = raw["em:0"];
        var totalUsed = raw["emdata:0"];

        // Bỏ qua nếu thiếu dữ liệu cần thiết
        if (!instant || !totalUsed) continue;

        var prefix = normalizeDeviceName(configuredName);

        pushField(result, prefix + "_TOTAL_CONSUMPTION", totalUsed.total_act);
        pushField(result, prefix + "_ACTIVE_POWER",      instant.total_act_power);

        pushField(result, prefix + "_L1_CURRENT",        instant.a_current);
        pushField(result, prefix + "_L2_CURRENT",        instant.b_current);
        pushField(result, prefix + "_L3_CURRENT",        instant.c_current);

        pushField(result, prefix + "_L1_VOLTAGE",        instant.a_voltage);
        pushField(result, prefix + "_L2_VOLTAGE",        instant.b_voltage);
        pushField(result, prefix + "_L3_VOLTAGE",        instant.c_voltage);
    }

    return result;
}
