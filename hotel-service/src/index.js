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

const EVENT_SOURCE = "hotel.service";

app.get("/", (_, res) => {
  res.send({ status: "ok" });
});

app.post("/bookHotel", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  // Simulate hotel booking logic here
  if (Math.random() < 0.5) {
    const hotelReservationTrackingID = Math.floor(Math.random() * 1000);
    console.log(
      `Hotel booked successfully; Correlation ID: ${correlationId}; Hotel Reservation Tracking ID: ${hotelReservationTrackingID}`
    );
    const params = {
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "HotelBooked",
          Detail: JSON.stringify({ correlationId }),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };

    const command = new PutEventsCommand(params);
    await client.send(command);
  } else {
    console.error(`Hotel booking failed; Correlation ID: ${correlationId}`);
    const params = {
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "HotelFailed",
          Detail: JSON.stringify({ correlationId }),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };
    const command = new PutEventsCommand(params);
    await client.send(command);
  }
});

app.post("/cancelHotel", async (req, res) => {
  const data = req.body.detail;
  const { correlationId } = data;
  res.sendStatus(202);

  const params = {
    Entries: [
      {
        Source: EVENT_SOURCE,
        DetailType: "HotelCancelled",
        Detail: JSON.stringify({ correlationId }),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };
  const command = new PutEventsCommand(params);
  await client.send(command);

  console.log(`Hotel cancelled with Correlation ID: ${correlationId}`);
});

app.listen(port, () => {
  console.log(`Hotel Booking Service running on port ${port}`);
});
