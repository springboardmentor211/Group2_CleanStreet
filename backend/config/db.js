const oracledb = require('oracledb');

oracledb.initOracleClient({
  libDir: 'C:\\oracle\\instantclient_19\\instantclient_19_29'
});

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: 'system',
    password: 'SUMAN',
    connectString: 'localhost:1521/XE'
  });
}

module.exports = getConnection;
