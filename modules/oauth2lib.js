let fs = require( "fs/promises" );
let pathlib = require( "path" );
let readline = require( "readline" );
let { google } = require( "googleapis" );

let OAuth2 = google.auth.OAuth2;

async function askUserForCredentials ( oauth2Client, scopes ) {
  let authUrl = oauth2Client.generateAuthUrl( {
    access_type: "offline",
    scope: scopes,
  } );
  let rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
  } );
  console.log( "Authorize this app by visiting this url: ", authUrl );
  const promise = new Promise( ( resolve, reject ) => {
    rl.question( "Enter the code from that page here: ", function ( code ) {
      rl.close();
      oauth2Client.getToken( code, function ( err, token ) {
        if ( err ) {
          //console.error("Error while trying to retrieve access token", err);
          reject( err );
        } else {
          resolve( token );
        }
      } );
    } );
  } );
  return promise;
}

function buildClient ( credentials ) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[ 0 ];

  return new OAuth2( clientId, clientSecret, redirectUrl );
}

async function getAuthorizedClient ( credentials, token_path, scopes ) {
  let oauth2Client = buildClient( credentials );
  const storedCredentials = await loadJSONFromFile( token_path );
  if ( storedCredentials ) {
    oauth2Client.credentials = storedCredentials;
  } else {
    const newCredentials = await askUserForCredentials( oauth2Client, scopes );
    await storeJSONToFile( token_path, newCredentials );
    oauth2Client.credentials = newCredentials;
  }
  return oauth2Client;
}

async function loadJSONFromFile ( path ) {
  try {
    const contents = await fs.readFile( path );
    return JSON.parse( contents );
  } catch ( err ) {
    console.error( `Error loading JSON from file ${ path } : ${ err }` );
    return null;
  }
}

async function ensureDirectoryExists ( dir ) {
  try {
    await fs.mkdir( dir, { recursive: true } );
  } catch ( err ) {
    if ( err.code != "EEXIST" ) {
      console.error( `Error making directory ${ dir } : ${ err }` );
      throw err;
    }
  }
}

async function storeJSONToFile ( path, content ) {
  const dir = pathlib.dirname( path )
  await ensureDirectoryExists( dir );
  try {
    return fs.writeFile( path, JSON.stringify( content ) );
  } catch ( err ) {
    console.error( `Error saving JSON to file ${ path } : ${ err }` );
    throw err;
  }
}

async function authorize ( client_id_path, token_path, scopes ) {
  const clientAuth = await loadJSONFromFile( client_id_path );
  return await getAuthorizedClient( clientAuth, token_path, scopes );
}

module.exports = authorize;
