# Datacake

This folder contains code and configuration assets that I developed and applied in **Datacake**.

## Contents

### 1) Downlink Code
Downlink payloads and control mappings used to send commands to devices from Datacake.
- Payload formats (JSON/HEX as required)
- Field-to-command mapping
- Example downlink requests

### 2) MQTT Decoder
Decoder logic for parsing MQTT payloads into Datacake fields.
- Supported topic/payload formats
- Field extraction and data normalization
- Example payloads and expected outputs

### 3) HTTP Decoder
Decoder logic for Datacake HTTP integrations/webhooks.
- Parsing incoming HTTP payloads (JSON/form-data)
- Mapping and validation rules
- Example requests and sample responses

### 4) LoRaWAN Decoder
Decoder logic for LoRaWAN uplinks (port-based decoding).
- Byte parsing and data types
- Unit conversions and scaling
- Warnings/edge-case handling

## Notes
- Each decoder/downlink implementation should include an `examples/` file (sample payloads) and inline comments where needed.
- Keep device/project-specific variants in dedicated subfolders to avoid mixing formats.
