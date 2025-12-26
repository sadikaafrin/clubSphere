require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 3000;
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf-8"
);

const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "fiery-bay-437809-h2.firebaseapp.com",
      "fiery-bay-437809-h2.web.app", 
    ],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

// jwt middlewares
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (!token) return res.status(401).send({ message: "Unauthorized Access!" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized Access!", err });
  }
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  const db = client.db("clubDB");
  const userCollection = db.collection("users");
  const clubsCollection = db.collection("clubs");
  const eventCollection = db.collection("events");
  const paymentCollection = db.collection("payments");
  const membershipCollection = db.collection("memberships");
  const joinedEventsCollection = db.collection("joinEvent");
  const managerRequestCollection = db.collection("managerRequests");

  // verify admin
  const verifyADMIN = async (req, res, next) => {
    const email = req.tokenEmail;
    const user = await userCollection.findOne({ email });
    if (user?.role !== "admin") {
      return res
        .status(403)
        .send({ message: "Admin only Action!", role: user?.role });
    }
    next();
  };
  // verify manager
  const verifyManager = async (req, res, next) => {
    const email = req.tokenEmail;
    const user = await userCollection.findOne({ email });
    if (user?.role !== "manager") {
      return res
        .status(403)
        .send({ message: "Manager only Action!", role: user?.role });
    }
    next();
  };

  // save or update user data
  app.post("/user", async (req, res) => {
    const userData = req.body;
    userData.created_at = new Date().toISOString();
    userData.last_loggedIn = new Date().toISOString();
    userData.role = "member";

    const query = {
      email: userData.email,
    };

    const alreadyExist = await userCollection.findOne(query);
    console.log("Already exist", !!alreadyExist);
    if (alreadyExist) {
      console.log("update user info");
      const result = await userCollection.updateOne(query, {
        $set: {
          last_loggedIn: new Date().toISOString(),
        },
      });
      return res.send(result);
    }
    console.log(userData);
    const result = await userCollection.insertOne(userData);
    res.send(result);
  });

  // get all user from admin
  app.get("/users", verifyJWT, verifyADMIN, async (req, res) => {
    const adminEmail = req.tokenEmail;
    const result = await userCollection
      .find({ email: { $ne: adminEmail } })
      .toArray();
    res.send(result);
  });

  app.patch("/update-role", verifyJWT, verifyADMIN, async (req, res) => {
    const { id, email, role } = req.body;
    try {
      // CASE 1: Seller request approval
      if (id) {
        const existingRequest = await managerRequestCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!existingRequest) {
          return res.status(404).send({ message: "Manager request not found" });
        }

        // update user role
        await userCollection.updateOne(
          { email: existingRequest.email },
          { $set: { role } }
        );

        // delete seller request
        await managerRequestCollection.deleteOne({
          _id: new ObjectId(id),
        });

        return res.send({
          message: "Manager request approved & role updated",
        });
      }

      // CASE 2: Admin updating any user role
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const result = await userCollection.updateOne(
        { email },
        { $set: { role } }
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .send({ message: "User not found or role unchanged" });
      }

      res.send({ message: "User role updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  });

  // get user role
  app.get("/user/role", verifyJWT, async (req, res) => {
    const result = await userCollection.findOne({ email: req.tokenEmail });
    res.send({ role: result?.role });
  });

  // rider related API
  // app.get("/riders", async (req, res) => {
  app.get("/approve-clubs", async (req, res) => {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    // const cursor = ridersCollection.find(query);
    const cursor = clubsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  });

  // patch api
  app.patch("/approve-clubs/:id", verifyJWT, verifyADMIN, async (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    const result = await clubsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          approvedBy: req.tokenEmail,
          approvedAt: new Date(),
        },
      }
    );

    res.send(result);
  });

  // Save club db
  app.post("/clubs", verifyJWT, verifyManager, async (req, res) => {
    const clubData = req.body;
    clubData.status = "pending";
    clubData.createdAt = new Date();
    const result = await clubsCollection.insertOne(clubData);
    res.send(result);
  });
  // get club
  app.get("/clubs", async (req, res) => {
    const result = await clubsCollection.find({ status: "approved" }).toArray();
    res.send(result);
  });
  // Update club
  app.patch("/clubs/:id", verifyJWT, verifyManager, async (req, res) => {
    const id = req.params.id;
    const data = { _id: new ObjectId(id) };
    const updatedData = req.body;
    const updateDoc = {
      $set: updatedData,
    };
    const result = await clubsCollection.updateOne(data, updateDoc);
    res.send(result);
  });

  // delete club
  app.delete("/club/:id", verifyJWT, verifyManager, async (req, res) => {
    const { id } = req.params;
    const result = await clubsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  });
  // event db
  app.post("/events", verifyJWT, verifyManager, async (req, res) => {
    const email = req.tokenEmail;
    const eventData = req.body;

    if (!eventData.clubId) {
      return res.status(400).send({ message: "clubId is required" });
    }

    const club = await clubsCollection.findOne({
      _id: new ObjectId(eventData.clubId),
      "manager.email": email,
      status: "approved",
    });

    if (!club) {
      return res
        .status(403)
        .send({ message: "You cannot add event to this club" });
    }

    const newEvent = {
      ...eventData,
      clubId: new ObjectId(eventData.clubId),
      createdAt: new Date(),
      createdBy: email,
    };

    const result = await eventCollection.insertOne(newEvent);
    res.send(result);
  });

  app.get("/events/:id", async (req, res) => {
    const id = req.params.id;
    const result = await eventCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
  });
  // get all event
  app.get("/my-events/:email", verifyJWT, verifyManager, async (req, res) => {
    const email = req.params.email;
    if (req.tokenEmail !== email) {
      return res.status(403).send({ message: "forbidden access" });
    }
    const result = await eventCollection.find({ createdBy: email }).toArray();
    res.send(result);
  });

  // admin can get all event
  app.get("/all-events", verifyJWT, verifyADMIN, async (req, res) => {
    const result = await eventCollection.find().toArray();
    res.send(result);
  });
  // update event
  app.patch("/event/:id", verifyJWT, verifyManager, async (req, res) => {
    const id = req.params.id;
    const data = { _id: new ObjectId(id) };
    const updatedData = req.body;
    const updateDoc = {
      $set: updatedData,
    };
    const result = await eventCollection.updateOne(data, updateDoc);
    res.send(result);
  });
  // delete event
  app.delete("/event/:id", verifyJWT, verifyManager, async (req, res) => {
    const { id } = req.params;

    const result = await eventCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  });

  app.post("/join-event", verifyJWT, async (req, res) => {
    const { eventId, clubId, userEmail } = req.body;

    try {
      const query = {
        eventId: new ObjectId(eventId),
        userEmail: userEmail,
      };

      const alreadyJoined = await joinedEventsCollection.findOne(query);

      if (alreadyJoined) {
        return res.status(400).send({
          success: false,
          message: "You have already registered for this event.",
        });
      }

      const joinDoc = {
        eventId: new ObjectId(eventId),
        clubId: new ObjectId(clubId),
        userEmail: userEmail,
        registeredAt: new Date(),
      };

      const result = await joinedEventsCollection.insertOne(joinDoc);
      res.status(201).send(result);
    } catch (error) {
      console.error("Join Event Error:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  });

  // Get events by clubId (Public route - no auth needed)
  app.get("/events/club/:clubId", async (req, res) => {
    try {
      const { clubId } = req.params;

      console.log("=== DEBUG INFO ===");
      console.log("Received clubId:", clubId);
      console.log("Type:", typeof clubId);
      console.log("Length:", clubId.length);
      console.log("Is valid ObjectId?", ObjectId.isValid(clubId));

      // Log the actual characters
      console.log("Characters:");
      for (let i = 0; i < clubId.length; i++) {
        console.log(
          `  [${i}] ${clubId[i]} - charCode: ${clubId.charCodeAt(i)}`
        );
      }

      // Check if it's a valid 24-character hex string
      const is24Chars = clubId.length === 24;
      const isHex = /^[0-9a-fA-F]+$/.test(clubId);
      console.log("Is 24 chars?", is24Chars);
      console.log("Is hex string?", isHex);

      if (!ObjectId.isValid(clubId)) {
        console.log("FAILED: ObjectId.isValid returned false");
        console.log("But length is 24?", clubId.length === 24);
        console.log("But is hex?", /^[0-9a-fA-F]+$/.test(clubId));

        return res.status(400).send({
          message: "Invalid club ID",
          debug: {
            receivedId: clubId,
            length: clubId.length,
            is24Chars: clubId.length === 24,
            isHex: /^[0-9a-fA-F]+$/.test(clubId),
          },
        });
      }

      console.log("Querying with ObjectId:", new ObjectId(clubId));

      const events = await eventCollection
        .find({
          clubId: new ObjectId(clubId),
        })
        .toArray();

      console.log("Found events:", events.length);
      console.log("Events:", events);

      res.send(events);
    } catch (error) {
      console.error("Error fetching club events:", error);
      res.status(500).send({
        message: "Server error fetching events",
        error: error.message,
      });
    }
  });

  // Optional: Get events with member status check
  app.get("/events/club/:clubId/member", verifyJWT, async (req, res) => {
    try {
      const { clubId } = req.params;
      const email = req.tokenEmail;

      if (!ObjectId.isValid(clubId)) {
        return res.status(400).send({ message: "Invalid club ID" });
      }

      // Check if user is member of this club
      const membership = await membershipCollection.findOne({
        clubId: new ObjectId(clubId),
        userEmail: email,
        status: "active",
      });

      const query = {
        clubId: new ObjectId(clubId),
      };

      // If not a member, only show non-exclusive events
      if (!membership) {
        query.isExclusive = { $ne: true };
      }

      const events = await eventCollection
        .find(query)
        // .sort({ date: 1 })
        .toArray();

      res.send({
        events,
        isMember: !!membership,
      });
    } catch (error) {
      console.error("Error fetching club events with member check:", error);
      res.status(500).send({ message: "Server error" });
    }
  });

  // memberShip db
  app.post("/memberships", verifyJWT, async (req, res) => {
    try {
      const email = req.tokenEmail;
      const memberData = req.body;

      if (!memberData.clubId) {
        return res.status(400).send({ message: "clubId is required" });
      }

      const user = await userCollection.findOne({ email });
      if (user.role !== "member") {
        return res.status(403).send({
          message: "Only users with 'member' role can join clubs",
        });
      }
      const club = await clubsCollection.findOne({
        _id: new ObjectId(memberData.clubId),
      });

      if (!club) {
        return res.status(404).send({ message: "Club not found" });
      }

      // Check if user is already a member (simple check without status)
      const existingMembership = await membershipCollection.findOne({
        userEmail: email,
        clubId: new ObjectId(memberData.clubId),
      });

      if (existingMembership) {
        return res.status(400).send({
          message: "You are already a member of this club",
        });
      }

      // If club is FREE (price = 0), create membership directly
      if (!club.price || club.price === 0) {
        const newMembership = {
          userEmail: email,
          clubId: new ObjectId(memberData.clubId),
          joinDate: new Date(),
          isActive: true,
        };

        const result = await membershipCollection.insertOne(newMembership);

        return res.send({
          success: true,
          message: "Successfully joined the club!",
          membershipId: result.insertedId,
          isFree: true,
        });
      }

      // If club is PAID (price > 0), create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: club.name,
                description: club.description || `Membership for ${club.name}`,
                images: club.image ? [club.image] : [],
              },
              unit_amount: Math.round(club.price * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        mode: "payment",
        metadata: {
          clubId: memberData.clubId,
          userEmail: email,
        },
        success_url: `${process.env.CLIENT_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}&clubId=${memberData.clubId}`,
        cancel_url: `${process.env.CLIENT_DOMAIN}/club/${memberData.clubId}`,
      });

      // Send response with Stripe session URL
      res.send({
        success: true,
        message: "Proceed to payment",
        url: session.url,
        sessionId: session.id,
        isFree: false,
      });
    } catch (error) {
      console.error("Create membership error:", error);
      res.status(500).send({
        message: "Failed to create membership",
        error: error.message,
      });
    }
  });
  // membership db
  app.get("/all-membership", verifyJWT, verifyADMIN, async (req, res) => {
    const result = await membershipCollection
      .aggregate([
        {
          $lookup: {
            from: "clubs",
            localField: "clubId",
            foreignField: "_id",
            as: "clubInfo",
          },
        },
        {
          $unwind: "$clubInfo",
        },
        {
          $project: {
            userEmail: 1,
            joinDate: 1,
            clubName: "$clubInfo.name",
          },
        },
      ])
      .toArray();
    res.send(result);
  });

  // Add this route to check membership status
  app.get("/memberships/check", verifyJWT, async (req, res) => {
    try {
      const email = req.tokenEmail;
      const { clubId } = req.query;

      if (!clubId) {
        return res.status(400).send({ message: "clubId is required" });
      }

      // Find membership for this user and club
      const membership = await membershipCollection.findOne({
        userEmail: email,
        clubId: new ObjectId(clubId),
      });

      res.send(membership || { status: "not_member" });
    } catch (error) {
      console.error("Check membership error:", error);
      res.status(500).send({
        message: "Failed to check membership status",
        error: error.message,
      });
    }
  });

  // get all my membership club
  app.get("/my-club-list/:email", verifyJWT, async (req, res) => {
    try {
      const email = req.params.email;
      const tokenEmail = req.tokenEmail;

      console.log("Email from params:", email);
      console.log("Token email from middleware:", tokenEmail);

      if (email !== tokenEmail) {
        return res.status(403).send({
          message: `Unauthorized access. You requested ${email}'s clubs but you are ${tokenEmail}`,
        });
      }

      // 1. Get clubs where user is MANAGER
      const managedClubs = await clubsCollection
        .find({ "manager.email": email })
        .toArray();
      console.log(`Found ${managedClubs.length} managed clubs`);

      // 2. Get clubs where user is a MEMBER
      const memberships = await membershipCollection
        .find({ userEmail: email, isActive: true })
        .toArray();
      console.log(`Found ${memberships.length} memberships`);

      // Get club IDs from memberships
      const memberClubIds = memberships
        .map((m) => {
          try {
            return new ObjectId(m.clubId);
          } catch (error) {
            console.error("Error converting clubId:", m.clubId, error.message);
            return null;
          }
        })
        .filter((id) => id !== null);

      console.log(`Valid club IDs: ${memberClubIds.length}`);

      let joinedClubs = [];
      if (memberClubIds.length > 0) {
        // Fetch full club details for joined clubs
        joinedClubs = await clubsCollection
          .find({
            _id: { $in: memberClubIds },
          })
          .toArray();
        console.log(`Found ${joinedClubs.length} joined clubs`);
      }

      // Add membership info to joined clubs
      const joinedClubsWithMembership = joinedClubs.map((club) => {
        const membership = memberships.find((m) => {
          try {
            return m.clubId.toString() === club._id.toString();
          } catch (error) {
            console.error("Error comparing IDs:", error);
            return false;
          }
        });
        return {
          ...club,
          membershipType: "member",
          joinDate: membership?.joinDate,
          membershipId: membership?._id,
          paymentStatus: membership?.paymentStatus || "free",
        };
      });

      // Add manager info to managed clubs
      const managedClubsWithType = managedClubs.map((club) => ({
        ...club,
        membershipType: "manager",
      }));

      // Combine both lists
      const allClubs = [...managedClubsWithType, ...joinedClubsWithMembership];

      console.log(`Total clubs: ${allClubs.length}`);
      res.send(allClubs);
    } catch (error) {
      console.error("Error fetching user's clubs:", error);
      res.status(500).send({
        message: "Failed to fetch clubs",
        error: error.message,
      });
    }
  });

  // Get clubs created by logged-in manager
  app.get("/my-clubs/:email", verifyJWT, verifyManager, async (req, res) => {
    const email = req.params.email;
    const clubs = await clubsCollection
      .find({ "manager.email": email })
      .toArray();

    res.send(clubs);
  });

  app.get("/clubs/:id", async (req, res) => {
    const id = req.params.id;
    const result = await clubsCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
  });

  // payment success
  app.post("/create-checkout-session", verifyJWT, async (req, res) => {
    try {
      const paymentInfo = req.body;

      const email = req.tokenEmail;

      // Find the user in the database
      const user = await userCollection.findOne({ email });

      // Check role inline
      if (!user || user.role !== "member") {
        return res
          .status(403)
          .send({ message: "Only members can make payment" });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: paymentInfo.name,
                description: paymentInfo.description,
                images: [paymentInfo.image],
              },
              unit_amount: paymentInfo.price * 100,
            },
            quantity: paymentInfo.quantity || 1,
          },
        ],
        customer_email: email, // Stripe email
        mode: "payment",
        metadata: {
          clubId: paymentInfo.clubId,
          member: email,
        },
        success_url: `${process.env.CLIENT_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_DOMAIN}/plant/${paymentInfo.clubId}`,
      });

      res.send({ url: session.url });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to create checkout session" });
    }
  });

  app.post("/payment-success", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const club = await clubsCollection.findOne({
        _id: new ObjectId(session.metadata.clubId),
      });

      // Check if membership already exists
      const existingMembership = await membershipCollection.findOne({
        userEmail: session.metadata.userEmail,
        clubId: new ObjectId(session.metadata.clubId),
      });

      if (existingMembership) {
        return res.status(400).send({
          message: "Membership already exists",
        });
      }

      if (session.payment_status === "paid" && club) {
        // 1. Create the membership record
        const newMembership = {
          userEmail: session.metadata.userEmail,
          clubId: new ObjectId(session.metadata.clubId),
          joinDate: new Date(),
          isActive: true,
          paymentStatus: "paid",
          transactionId: session.payment_intent,
          amountPaid: session.amount_total / 100,
        };

        const membershipResult = await membershipCollection.insertOne(
          newMembership
        );

        // 2. Create order record (your existing logic)
        const orderInfo = {
          paidAt: new Date(),
          clubId: session.metadata.clubId,
          transactionId: session.payment_intent,
          member: session.metadata.userEmail,
          status: "active",
          manager: club.manager,
          name: club.name,
          category: club.category,
          quantity: 1,
          price: session.amount_total / 100,
          image: club?.image,
          membershipId: membershipResult.insertedId, // Link to membership
        };

        const orderResult = await paymentCollection.insertOne(orderInfo);

        // 3. Update club quantity (if needed)
        if (club.quantity > 0) {
          await clubsCollection.updateOne(
            { _id: new ObjectId(session.metadata.clubId) },
            { $inc: { quantity: -1 } }
          );
        }

        return res.send({
          success: true,
          transactionId: session.payment_intent,
          orderId: orderResult.insertedId,
          membershipId: membershipResult.insertedId,
          message: "Membership created successfully",
        });
      }

      res.send({
        success: false,
        message: "Payment not completed or club not found",
      });
    } catch (error) {
      console.error("Payment success error:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/payment-history", verifyJWT, async (req, res) => {
    const email = req.tokenEmail;
    const result = await paymentCollection.find({ member: email }).toArray();
    res.send(result);
  });

  try {
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Server..222");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
