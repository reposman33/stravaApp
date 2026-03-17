import { environment } from "./.environment.js";

export const refreshAccessToken = async () => {

  const url = 'https://www.strava.com/oauth/token';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: environment.secrets.client_id,
      client_secret: environment.secrets.client_secret,
      code: environment.secrets.code,
      grant_type: 'authorization_code'
    })
  })

  const data = await response.json()

  if(response.ok) {
    console.log('data: ', data, '\n');
    console.log('data.expires_in: ', Math.floor(data.expires_in / 60 / 60),  ' uur');
    return data.access_token
  } else {
    console.log('refresh mislukt: ', data)
  }
}

/** 
 * Haal activiteiten op van de Strava API. Alle activiteiten wporden opgevraagd. Per request environment.
 * activitiesPerPage activiteiten
 * */ 
export const getStravaActivities = async (filterBy) => {
  const headers = {
    'Authorization': `Bearer ${environment.secrets.accessToken}`
  }

  let page = 1; // strava begint bij pagina 1
  let go = true
  const allActivities = []

  try {
    while(go) {
      console.log(`Pagina ${page} ophalen...`)
      
      const response = await fetch(`${environment.URL.replace('{activitiesPerPage}', environment.activitiesPerPage).replace('{page}', page)}`,{method: 'GET',headers: headers})
      const data = await response.json()
      
      if(!response.ok) {
        const errorMessage = data.message || response.statusText
        throw new Error(`Strava API error: ${response.status} - ${errorMessage}`) // `${data}` converteert data naar string dus ipv object krijg je "[Object object]"
      }
      if(data.length > 0) {
        allActivities.push(...data)
        page++
      }
      go = data.length === 50 // alles kleiner dan 50 betekent: dit was de laatate batch. Slim...
    }
    
    allActivities.forEach(activity => { 
      console.log(activity)
    })
    console.log(`${page} paginas opgehaald: ${page * environment.activitiesPerPage} activiteiten`);
  } 
  catch(e) {
    console.log(e)
  }
}

/**
 * dit moet je wel hier plaatsen: bovenaan is self nog leeg 
 */
import * as self from './javascript.js';

const methods = Object.keys(self).filter(key => typeof self[key] === 'function')
// 'methods' is nu een array van methodenamen. We kunnen dynamisch bepalen of het argument (process.argv[3]) een valide methodenaam is
if (methods.includes(process.argv[2])) {
  console.log('Uitvoeren: methode', process.argv[2], '()')
  // voer de methode uit. Niet met .call() want we willen geen specifieke this (1e parameter) meegeven
  self[process.argv[2]](process.argv[3])
}