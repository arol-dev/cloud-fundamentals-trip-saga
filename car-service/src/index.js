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

const EVENT_SOURCE = "car.service";

app.get("/", (_, res) => {
  res.send({ status: "ok" });
});

app.post("/bookCar", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  // Simulate car booking logic here
  if (Math.random() < 0.5) {
    const carReservationTrackingID = Math.floor(Math.random() * 1000);
    console.log(
      `Car booked successfully; Correlation ID: ${correlationId}; Car Reservation Tracking ID: ${carReservationTrackingID}`
    );
    const params = {
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "CarBooked",
          Detail: JSON.stringify({ correlationId }),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };

    const command = new PutEventsCommand(params);
    await client.send(command);
  } else {
    console.error(`Car booking failed; Correlation ID: ${correlationId}`);
    const params = {
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "CarFailed",
          Detail: JSON.stringify({ correlationId }),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };
    const command = new PutEventsCommand(params);
    await client.send(command);
  }
});

app.post("/cancelCar", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  console.log(`Car cancelled; Correlation ID: ${correlationId}`);
  const params = {
    Entries: [
      {
        Source: EVENT_SOURCE,
        DetailType: "CarCancelled",
        Detail: JSON.stringify({ correlationId }),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };
  const command = new PutEventsCommand(params);
  await client.send(command);
});

app.listen(port, () => {
  console.log(`Car Booking Service running on port ${port}`);
});
