const express = require("express");
const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");
const uuid = require("uuid");

const app = express();
const port = process.env.PORT || 3000;

const client = new EventBridgeClient();

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;
if (!EVENT_BUS_NAME) {
  console.error("Falta la variable de entorno EVENT_BUS_NAME");
  process.exit(1);
}

const EVENT_SOURCE = "travel.service";

app.get("/", (_, res) => {
  res.send({ status: "ok" });
});

app.post("/initiateBooking", async (req, res) => {
  const correlationId = generateCorrelationId();

  const params = {
    Entries: [
      {
        Source: EVENT_SOURCE,
        DetailType: "TravelBooked",
        Detail: JSON.stringify({ correlationId }),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };

  const command = new PutEventsCommand(params);
  const output = await client.send(command);

  console.log(`Booking initiated with Correlation ID: ${correlationId}`);
  console.log(
    `EventBridge response (cid: ${correlationId}): ${JSON.stringify(output)}`
  );
  res.send({ correlationId });
});

function generateCorrelationId() {
  return `cid-${uuid.v4()}`;
}

app.listen(port, () => {
  console.log(`Travel Booking Service running on port ${port}`);
});
