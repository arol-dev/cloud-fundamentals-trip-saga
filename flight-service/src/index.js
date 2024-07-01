const express = require("express");
const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

const app = express();
const port = process.env.PORT || 3000;

const client = new EventBridgeClient();

app.use(express.json());

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;
if (!EVENT_BUS_NAME) {
  console.error("Falta la variable de entorno EVENT_BUS_NAME");
  process.exit(1);
}

const EVENT_SOURCE = "flight.service";

app.get("/", (_, res) => {
  res.send({ status: "ok" });
});

app.post("/bookFlight", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  console.log(`Flight booking started with Correlation ID: ${correlationId}`);

  setTimeout(async () => {
    // Simulate flight booking logic here
    if (Math.random() < 0.5) {
      const flightReservationTrackingID = Math.floor(Math.random() * 1000);
      console.log(
        `Flight booked successfully; Correlation ID: ${correlationId}; Flight Reservation Tracking ID: ${flightReservationTrackingID}`
      );
      const params = {
        Entries: [
          {
            Source: EVENT_SOURCE,
            DetailType: "FlightBooked",
            Detail: JSON.stringify({ correlationId }),
            EventBusName: EVENT_BUS_NAME,
          },
        ],
      };

      const command = new PutEventsCommand(params);
      await client.send(command);
    } else {
      console.error(`Flight booking failed; Correlation ID: ${correlationId}`);
      const params = {
        Entries: [
          {
            Source: EVENT_SOURCE,
            DetailType: "FlightFailed",
            Detail: JSON.stringify({ correlationId }),
            EventBusName: EVENT_BUS_NAME,
          },
        ],
      };
      const command = new PutEventsCommand(params);
      await client.send(command);
    }
  }, 3000);
});

app.post("/cancelFlight", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  console.log(`Flight cancelled; Correlation ID: ${correlationId}`);

  const params = {
    Entries: [
      {
        Source: EVENT_SOURCE,
        DetailType: "FlightCancelled",
        Detail: JSON.stringify({ correlationId }),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };
  const command = new PutEventsCommand(params);
  await client.send(command);
});

app.listen(port, () => {
  console.log(`Flight Booking Service running on port ${port}`);
});
