
export default class IG {
  constructor(){

    // Default API gateway
    this.urlRoot = "https://demo-api.ig.com/gateway/deal";

    // Variables
    this.apiKey = "";
    this.accountId = null;
    this.account_token = null;
    this.client_token = null;
    this.lsEndpoint = null;
    this.lsClient;
    this.ticketSubscription;
    this.accountSubscription;
  }

  login(apiKey, username, unsafePassword) {

     // Get username and password from user interface fields
     this.apiKey = apiKey;
     let identifier = username;
     let password = unsafePassword;

     if (this.apiKey=="" || identifier=="" || password=="") {
         return false;
     }

     password = this.encryptedPassword(password);
     console.log("Encrypted password " + password);

     // Create a login request, ie a POST request to /session
     let req = new Request();
     req.method = "POST";
     req.url = this.urlRoot + "/session";

     // Set up standard request headers, i.e. the api key, the request content type (JSON), 
     // and the expected response content type (JSON)
     req.headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "Accept": "application/json; charset=UTF-8",
        "X-IG-API-KEY": this.apiKey,
        "Version": "2"
     };

     // Set up the request body with the user identifier (username) and password
     let bodyParams = {};
     bodyParams["identifier"] = identifier;
     bodyParams["password"] = password;
     bodyParams["encryptedPassword"] = true;
     req.body = JSON.stringify(bodyParams);

     // Send the request via a Javascript AJAX call
     try {
        $.ajax({
           type: req.method,
           url: req.url,
           data: req.body,
           headers: req.headers,
           async: false,
           mimeType: req.binary ? 'text/plain; charset=x-user-defined' : null,
           success: (response, status, data) => {

              // Successful login 
              // Extract account and client session tokens, active account id, and the Lightstreamer endpoint,
              // as these will be required for subsequent requests
              this.account_token = data.getResponseHeader("X-SECURITY-TOKEN");
              console.log("X-SECURITY-TOKEN: " + this.account_token);
              this.client_token = data.getResponseHeader("CST");
              console.log("CST: " + this.client_token);
              this.accountId = response.currentAccountId;
              this.lsEndpoint = response.lightstreamerEndpoint;
              // Show logged in status message on screen
           },
           error: (response, status, error) => {

              // Login failed, usually because the login id and password aren't correct
              console.log(response);
           }
        });
     } catch (e) {
        console.log(e);
     }

      return true;

  }

/**
 * Encryption function
 */

  encryptedPassword(password) {

      let key = this.encryptionKey();
      let asn, tree,
      rsa = new pidCrypt.RSA(),
      decodedKey = pidCryptUtil.decodeBase64(key.encryptionKey);

      asn = pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(decodedKey));
      tree = asn.toHexTree();

      rsa.setPublicKeyFromASN(tree);

      return pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(rsa.encrypt(password += '|' + key.timeStamp)))

  }


  /**
   * Encryption key getter function
   */
  encryptionKey() {


          // Set up the request as a GET request to the address /session/encryptionkey
          let req = new Request();
          req.method = "GET";
          req.url = this.urlRoot + "/session/encryptionKey";

          // Set up the request headers, i.e. the api key, the account security session token, the client security token,
          // the request content type (JSON), and the expected response content type (JSON)
          req.headers = {
              "X-IG-API-KEY": this.apiKey,
              "Content-Type": "application/json; charset=UTF-8",
              "Accept": "application/json; charset=UTF-8"
          };

          // No body is required, as this is a GET request
          req.body = "";

          // Send the request via a Javascript AJAX call
          var key;
          try {
              $.ajax({
                  type: req.method,
                  url: req.url,
                  data: req.body,
                  headers: req.headers,
                  async: false,
                  mimeType: req.binary ? 'text/plain; charset=x-user-defined' : null,
                  error: function (response, status, error) {
                      console.log(response);
                  },
                  success: function (response, status, data) {

                      console.log("Encryption key retrieved ");
                      key = response;
                  }
              });
          } catch (e) {

              // Failed to get the encryption key
              console.log(e);
          }

          return key;

  }



  /*
   * Function to connect to Lightstreamer
   */
  connectToLightstreamer() {

    require(['LightstreamerClient', 'Subscription'], (LightstreamerClient, Subscription) => {


        // Instantiate Lightstreamer client instance
        console.log("Connecting to Lighstreamer: " + this.lsEndpoint);
        this.lsClient = new LightstreamerClient(this.lsEndpoint);

        // Set up login credentials: client
        this.lsClient.connectionDetails.setUser(this.accountId);

        let password = "";
        if (this.client_token) {
           password = "CST-" + this.client_token;
        }
        if (this.client_token && this.account_token) {
           password = password + "|";
        }
        if (this.account_token) {
           password = password + "XST-" + this.account_token;
        }
        console.log(" LSS login " + this.accountId + " - " + password);
        this.lsClient.connectionDetails.setPassword(password);

        // Add connection event listener callback functions
        this.lsClient.addListener({
           onListenStart: function () {
              console.log('Lightstreamer client - start listening');
           },
           onStatusChange: function (status) {
              console.log('Lightstreamer connection status:' + status);
           }
        });

        // Allowed bandwidth in kilobits/s
        //lsClient.connectionOptions.setMaxBandwidth();

        // Connect to Lightstreamer
        this.lsClient.connect();

    });
  }

  subscribeToLightstreamerTradeUpdates() {

    require(['LightstreamerClient', 'Subscription'], (LightstreamerClient, Subscription) => {
     // Create a Lightstreamer subscription for the BID and OFFER prices for the relevant market

        // Set up the Lightstreamer FIDs
        this.accountSubscription = new Subscription(
           "DISTINCT",
           "TRADE:" + this.accountId,
           [
              "CONFIRMS",
              "OPU",
              "WOU"
           ]
        );

        this.accountSubscription.setRequestedMaxFrequency("unfiltered");

        // Set up the Lightstreamer event listeners
        this.accountSubscription.addListener({
           onSubscription: function () {
              console.log('trade updates subscription succeeded');
           },
           onSubscriptionError: function (code, message) {
              console.log('trade updates subscription failure: ' + code + " message: " + message);
           },
           onItemUpdate: function (updateInfo) {

              console.log("received trade update message: " + updateInfo.getItemName());

              updateInfo.forEachField(function (fieldName, fieldPos, value) {
                 if (value != 'INV') {
                    console.log("field: " + fieldName + " - value: " + value);
                    if (fieldName == "CONFIRMS") {
                       //showDealConfirmDialog(value);
                    } else {
                       //showAccountStatusUpdate(value);
                    }
                 }
              });
           },
           onItemLostUpdates: function () {
              console.log("trade updates subscription - item lost");
           }

        });

        // Subscribe to Lightstreamer
        this.lsClient.subscribe(this.accountSubscription);
        
    });
  }

  /*
   * Function to retrieve the positions for the active account
   */
  positions() {

     // Set up the request as a GET request to the address /positions
     let req = new Request();
     req.method = "GET";
     req.url = urlRoot + "/positions";

     // Set up the request headers, i.e. the api key, the account security session token, the client security token, 
     // the request content type (JSON), and the expected response content type (JSON)   
     req.headers = {
        "X-IG-API-KEY": apiKey,
        "X-SECURITY-TOKEN": account_token,
        "CST": client_token,
        "Content-Type": "application/json; charset=UTF-8",
        "Accept": "application/json; charset=UTF-8"
     };

     // No body is required, as this is a GET request
     req.body = "";

     let positions = [];

     // Send the request via a Javascript AJAX call
     try {
        $.ajax({
           type: req.method,
           url: req.url,
           data: req.body,
           headers: req.headers,
           async: false,
           mimeType: req.binary ? 'text/plain; charset=x-user-defined' : null,
           error: function (response, status, error) {
              // An unexpected error occurred
              console.log(response);
           },
           success: (response, status, data) => {


              // Log and display the retrieved positions, along with the Lightstreamer subscription FIDs for the BID and OFFER
              // price of each position's market
              var epicsItems = [];
              $(response.positions).each(function (index) {
                 let positionData = response.positions[index];
                 let epic = positionData.market.epic;
                 let canSubscribe = positionData.market.streamingPricesAvailable;

                 positions.push(new Position(epic, positionData));

                 if (canSubscribe) {
                    var epicsItem = "L1:" + positionData.market.epic;
                    epicsItems.push(epicsItem);
                    console.log("adding subscription index / item: " + index + " / " + epicsItem);
                 }
              });

              // Now subscribe to the BID and OFFER prices for each position market
              if (epicsItems.length > 0) {

                    // Set up Lightstreamer FIDs
                    var subscription = new Subscription(
                       "MERGE",
                       epicsItems,
                       [
                          "BID",
                          "OFFER",
                          "MARKET_STATE"
                       ]
                    );

                    subscription.setRequestedSnapshot("yes");

                    // Set up Lightstreamer event listener
                    subscription.addListener({
                       onSubscription: function () {
                          console.log('subscribed');
                       },
                       onSubscriptionError: function (code, message) {
                          console.log('subscription failure: ' + code + " message: " + message);
                       },
                       onItemUpdate: function (updateInfo) {

                          // Lightstreamer published some data
                          // The item name in this case will be the market EPIC for which prices were subscribed to
                          var epic = updateInfo.getItemName().split(":")[1];
                          updateInfo.forEachField(function (fieldName, fieldPos, value) {
                             let fieldId = epic.replace(/\./g, "_") + "_" + fieldName;
                             //let cell = $("." + fieldId);

                             if (fieldName == "MARKET_STATE") {
                                //update status image
                                if (value == "TRADEABLE") {
                                   //cell.attr("src", "assets/img/open.png")
                                } else if (value == "EDIT") {
                                   //cell.attr("src", "assets/img/edit.png")
                                } else {
                                   //cell.attr("src", "assets/img/close.png")
                                }
                             } else {
                                if (fieldName && cell) {
                                   //cell.empty();
                                   //cell.append($('<div>').addClass("tickCell").toggle("highlight").append(value));
                                }
                             }
                          });
                       }
                    });

                    // Subscribe to Lightstreamer
                    this.lsClient.subscribe(subscription);

              }
           }
        });
     } catch (e) {
        console.log(e);
     }
  }


}

/*
 * Request class
 */
class Request {
  constructor(o) {
    this.headers = {"Content-Type": "application/json; charset=UTF-8", "Accept": "application/json; charset=UTF-8"};
    this.body = "";
    this.method = "";
    this.url = "";
  }
}

class Position {
  constructor(epic, positionData) {
    this.epic = epic;
    this.positionData = positionData;
  }
}



