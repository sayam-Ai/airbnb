const sampleHomes = require("./sampleHomes");
const Home = require("../models/home");

const SEED_MARKER_ID = "sample-homes-v1";

module.exports = async function seedSampleHomes() {
  const metadata = Home.db.collection("appMetadata");
  const alreadySeeded = await metadata.findOne({ _id: SEED_MARKER_ID });

  if (alreadySeeded) {
    return;
  }

  await Promise.all(
    sampleHomes.map((home) =>
      Home.updateOne(
        { _id: home._id },
        { $setOnInsert: home },
        { upsert: true },
      ),
    ),
  );

  await metadata.updateOne(
    { _id: SEED_MARKER_ID },
    { $setOnInsert: { seededAt: new Date() } },
    { upsert: true },
  );
};
