const { prisma } = require("../src/utils/db");

const BROKERS = [
  // [name, removalUrl, removalMethod, difficulty, category, dataTypes, optOutEmail, optOutTemplate, estimatedDays]
  ["Spokeo", "https://www.spokeo.com/optout", "form", "easy", "people_search", "name,address,phone,email", null, null, 3],
  ["BeenVerified", "https://www.beenverified.com/faq/opt-out/", "form", "medium", "people_search", "name,address,phone,email,relatives", null, null, 7],
  ["Whitepages", "https://www.whitepages.com/suppression-requests", "form", "medium", "people_search", "name,address,phone", null, null, 7],
  ["FastPeopleSearch", "https://www.fastpeoplesearch.com/removal", "form", "easy", "people_search", "name,address,phone", null, null, 3],
  ["TruthFinder", "https://www.truthfinder.com/opt-out/", "form", "easy", "background_check", "name,address,phone,criminal", null, null, 5],
  ["InstantCheckmate", "https://www.instantcheckmate.com/opt-out/", "form", "medium", "background_check", "name,address,phone,criminal", null, null, 7],
  ["Intelius", "https://www.intelius.com/opt-out", "form", "medium", "people_search", "name,address,phone,email", null, null, 7],
  ["Radaris", "https://radaris.com/page/how-to-remove", "email", "hard", "people_search", "name,address,phone,email,social", "support@radaris.com", "Subject: Data Removal Request\n\nI am requesting the removal of all personal information associated with my name and email address ({email}) from your database per CCPA/GDPR. Please confirm removal within 30 days.\n\nFull Name: {name}\nEmail: {email}", 14],
  ["MyLife", "https://www.mylife.com/ccpa/index.pubview", "form", "hard", "reputation", "name,address,phone,reputation_score", null, null, 21],
  ["ZoomInfo", "https://www.zoominfo.com/about-zoominfo/privacy/manage-profile", "email", "hard", "business", "name,email,company,title,phone", "privacy@zoominfo.com", "Subject: CCPA Data Deletion Request\n\nI am requesting deletion of all my data per CCPA.\n\nFull Name: {name}\nEmail: {email}", 14],
  ["TrueCaller", "https://www.truecaller.com/unlisting", "form", "easy", "phone_lookup", "name,phone", null, null, 1],
  ["PeopleFinder", "https://www.peoplefinder.com/optout.php", "email", "medium", "people_search", "name,address,phone", "optout@peoplefinder.com", "Subject: Opt-Out Request\n\nPlease remove my listing.\n\nFull Name: {name}\nEmail: {email}", 10],
  ["USSearch", "https://www.ussearch.com/opt-out/submit/", "email", "medium", "people_search", "name,address,phone", "optout@ussearch.com", "Subject: Opt-Out Request\n\nPlease remove my data.\n\nFull Name: {name}\nEmail: {email}", 10],
  ["PeopleSmart", "https://www.peoplesmart.com/optout-go", "form", "easy", "people_search", "name,address,phone,email", null, null, 3],
  ["GoLookUp", "https://www.golookup.com/support/optout", "form", "easy", "people_search", "name,address,phone", null, null, 5],
  ["That'sThem", "https://thatsthem.com/optout", "form", "easy", "people_search", "name,address,phone,email,ip", null, null, 3],
  ["Nuwber", "https://nuwber.com/removal/link", "form", "medium", "people_search", "name,address,phone", null, null, 7],
  ["ClustrMaps", "https://clustrmaps.com/bl/opt-out", "email", "medium", "location", "name,address", "optout@clustrmaps.com", "Subject: Opt Out Request\n\nPlease remove my listing.\n\nName: {name}\nEmail: {email}", 10],

  // NEW BROKERS
  ["Acxiom", "https://isapps.acxiom.com/optout/optout.aspx", "form", "hard", "data_aggregator", "name,address,phone,email,demographics", null, null, 14],
  ["LexisNexis", "https://consumer.risk.lexisnexis.com/request", "form", "hard", "background_check", "name,address,phone,ssn_partial,employment", null, null, 30],
  ["Oracle Data Cloud", "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html", "email", "hard", "data_aggregator", "name,email,browsing,purchase_history", "privacy_ww@oracle.com", "Subject: CCPA Data Deletion Request\n\nI request deletion of all my data per CCPA.\n\nFull Name: {name}\nEmail: {email}", 30],
  ["Epsilon", "https://us.epsilon.com/privacy-policy#individual-rights-requests", "email", "hard", "marketing", "name,address,email,purchase_history", "privacy@epsilon.com", "Subject: Data Deletion Request\n\nPlease delete all data associated with:\n\nName: {name}\nEmail: {email}", 30],
  ["Veromi", "https://www.veromi.net", "form", "medium", "people_search", "name,address,phone", null, null, 7],
  ["PeekYou", "https://www.peekyou.com/about/contact/optout/", "form", "easy", "social_aggregator", "name,social_profiles,location", null, null, 5],
  ["PrivateEye", "https://www.privateeye.com/static/view/optout/", "form", "medium", "background_check", "name,address,phone,criminal", null, null, 7],
  ["SearchPeopleFree", "https://www.searchpeoplefree.com/opt-out", "form", "easy", "people_search", "name,address,phone", null, null, 3],
  ["Addresses.com", "https://www.addresses.com/optout.php", "form", "easy", "people_search", "name,address", null, null, 5],
  ["PublicRecordsNow", "https://www.publicrecordsnow.com/static/view/optout/", "form", "medium", "public_records", "name,address,phone,court_records", null, null, 10],
  ["USA People Search", "https://www.usa-people-search.com/manage/default.aspx", "form", "easy", "people_search", "name,address,phone", null, null, 3],
  ["Cubib", "https://cubib.com/optout.php", "form", "easy", "people_search", "name,address,phone", null, null, 5],
  ["Cyberbackgroundchecks", "https://www.cyberbackgroundchecks.com/removal", "form", "easy", "background_check", "name,address,phone", null, null, 3],
  ["TelephoneDirectories", "https://www.telephonedirectories.us", "form", "easy", "phone_lookup", "name,phone", null, null, 3],
  ["VoterRecords", "https://voterrecords.com/faq", "email", "hard", "voter_data", "name,address,party_affiliation", "support@voterrecords.com", "Subject: Record Removal\n\nPlease remove my voter record listing.\n\nName: {name}\nEmail: {email}", 14],
  ["FamilyTreeNow", "https://www.familytreenow.com/optout", "form", "easy", "people_search", "name,address,relatives,age", null, null, 3],
  ["NewEnglandFacts", "https://newenglandfacts.com/optout/", "form", "easy", "people_search", "name,address,phone", null, null, 5],
  ["OfficialUSA", "https://www.officialusa.com/opt-out/", "form", "easy", "people_search", "name,address,phone", null, null, 5],
  ["AdvancedBackgroundChecks", "https://www.advancedbackgroundchecks.com/removal", "form", "easy", "background_check", "name,address,phone", null, null, 3],
  ["CheckPeople", "https://www.checkpeople.com/opt-out", "form", "easy", "people_search", "name,address,phone,email", null, null, 5],
];

async function main() {
  for (const [
    name,
    removalUrl,
    removalMethod,
    difficulty,
    category,
    dataTypes,
    optOutEmail,
    optOutTemplate,
    estimatedDays,
  ] of BROKERS) {
    await prisma.dataBroker.upsert({
      where: { name },
      update: {
        removalUrl,
        removalMethod,
        difficulty,
        category,
        dataTypes,
        optOutEmail,
        optOutTemplate,
        estimatedDays,
      },
      create: {
        name,
        removalUrl,
        removalMethod,
        difficulty,
        category,
        dataTypes,
        optOutEmail,
        optOutTemplate,
        estimatedDays,
      },
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
