# Node-RED

This folder contains the **Node-RED flows** and **Function node code** that I have developed and used in production and testing environments.

The content is organized to support common IoT tasks such as data collection, transformation, automation, and integration with third-party platforms.

## What’s Included

### 1) Flows & Subflows
Reusable flows/subflows that implement end-to-end logic:
- Data ingestion from MQTT topics
- Processing and normalization of device telemetry
- Routing data to different services (Datacake, ThingsBoard, databases, etc.)
- Control logic and automation workflows

### 2) Function Node Code
Function snippets used across flows for:
- Mapping and transforming MQTT payloads into structured objects/fields
- Data validation, filtering, debouncing, and formatting
- State handling (e.g., online/offline, last-seen, timers)
- Building payloads for control commands (RPC/downlink)

### 3) Integrations
Implementations for common integrations used in IoT stacks:
- **MQTT**: subscribe/publish patterns, topic conventions, retained messages
- **GraphQL API**: queries/mutations (e.g., device management, data sync)
- **REST API**: HTTP requests, authentication headers, pagination handling
- Optional utilities: webhook handlers, cron/scheduler triggers

## Usage Notes
- Node-RED content is typically stored as exported JSON. Import via:
  **Menu → Import → Clipboard**.
