const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const BROKERS = [
  ["Spokeo", "https://www.spokeo.com/optout", "form", "easy"],
  ["BeenVerified", "https://www.beenverified.com/faq/opt-out/", "form", "medium"],
  ["ZoomInfo", "https://www.zoominfo.com/about-zoominfo/privacy/manage-profile", "email", "hard"],
  ["TruthFinder", "https://www.truthfinder.com/opt-out/", "form", "easy"],
  ["FastPeopleSearch", "https://www.fastpeoplesearch.com/removal", "form", "easy"],
  ["PeopleFinder", "https://www.peoplefinder.com/optout.php", "email", "medium"],
  ["GoLookUp", "https://www.golookup.com/support/optout", "form", "easy"],
  ["Whitepages", "https://www.whitepages.com/suppression-requests", "form", "medium"],
  ["USSearch", "https://www.ussearch.com/opt-out/submit/", "email", "medium"],
  ["TrueCaller", "https://www.truecaller.com/unlisting", "form", "easy"],
  ["Intelius", "https://www.intelius.com/opt-out", "form", "medium"],
  ["PeopleSmart", "https://www.peoplesmart.com/optout-go", "form", "easy"],
  ["InstantCheckmate", "https://www.instantcheckmate.com/opt-out/", "form", "medium"],
  ["Radaris", "https://radaris.com/page/how-to-remove", "email", "hard"],
  ["MyLife", "https://www.mylife.com/ccpa/index.pubview", "form", "hard"],
  ["Pipl", "https://pipl.com/personal-information-removal-request", "email", "hard"],
  ["AnyWho", "https://www.anywho.com/help/privacy", "form", "easy"],
  ["That'sThem", "https://thatsthem.com/optout", "form", "easy"],
  ["Nuwber", "https://nuwber.com/removal/link", "form", "medium"],
  ["ClustrMaps", "https://clustrmaps.com/bl/opt-out", "email", "medium"],
];

async function main() {
  for (const [name, removalUrl, removalMethod, difficulty] of BROKERS) {
    await prisma.dataBroker.upsert({
      where: { name },
      update: { removalUrl, removalMethod, difficulty },
      create: { name, removalUrl, removalMethod, difficulty },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    process.stderr.write(String(e) + "\n");
    prisma.$disconnect();
    process.exit(1);
  });
