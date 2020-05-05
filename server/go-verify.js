const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const uaParser = require('ua-parser-js');

const afterLastSlash = /[^/]+$/;
const MONGODB_DATABASE = process.env.MONGODB_URI.match(afterLastSlash)[0];

const collapseDuplicates = (objects) => {
  const collapsedObjects = objects.reduce((acc, obj) => {
    /* eslint-disable-next-line camelcase */
    const { _id, challenge_timestamp, ...staticEntries } = obj;
    const key = JSON.stringify(staticEntries);

    acc[key] = {
      ...staticEntries,
      _id: obj._id, /* eslint-disable-line */
      challenge_timestamp: obj.challenge_timestamp,
      duplicates: (acc[key] && acc[key].duplicates + 1) || 1,
    };

    return acc;
  }, {});

  return Object.values(collapsedObjects);
};

const getScores = (req, res) =>
  MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
    if (err) throw err;
    const dbo = db.db(MONGODB_DATABASE);

    dbo.collection('visits').find().toArray((err, visits) => {
      if (err) throw err;
      const collapsedVisits = collapseDuplicates(visits);
      const resJson = collapsedVisits
        .map(({ score, browser, os, duplicates, userName }) => (
          {
            score,
            browser,
            os,
            ...(duplicates > 1 && {
              duplicates,
            }),
            userName,
          }
        ));
      res.json(resJson);
      db.close();
    });
  });

const postGoVerify = async (req, res) => {
  const body = `secret=${process.env.CAPTCHA_SECRET}&response=${req.body.response}`;
  console.log('💼 body:', body.split('&'));

  try {
    const ua = uaParser(req.headers['user-agent']);
    console.log('user-agent', ua);

    const siteVerify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const jsonVerified = await siteVerify.json();
    console.log('---', 'json', jsonVerified, '---');

    /* eslint-disable-next-line no-unused-expressions */
    jsonVerified.success && MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
      if (err) throw err;
      const dbo = db.db(MONGODB_DATABASE);
      const visit = {
        score: jsonVerified.score,
        browser: `${ua.browser.name} ${ua.browser.major}`,
        browser_version: ua.browser.version,
        os: `${ua.os.name} ${ua.os.version}`,
        engine: `${ua.engine.name} ${ua.engine.version}`,
        ua: req.headers['user-agent'],
        challenge_timestamp: jsonVerified.challenge_ts,
        userName: jsonVerified.userName,
      };
      dbo.collection('visits').insertOne(visit, (err, res) => {
        if (err) throw err;
        console.log('1 document inserted');
        db.close();
      });
    });

    return await res.json(jsonVerified);
  } catch (error) {
    console.log('error', error);

    return await res.json({ error });
  }
};

module.exports = {
  getScores,
  postGoVerify,
};