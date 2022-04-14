var mqtt = require('mqtt')
var client  = mqtt.connect('wss://ogc-demo.k8s.ilt-dmz.iosb.fraunhofer.de/mqtt')

client.on('connect', function () {
  client.subscribe(['v1.0/Datastreams'], function (err,granted) {
    if (!err) {
        console.log(granted);
        client.publish('v1.0/Datastreams','test');
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(`Topic: ${topic}, Message: ${message.toString()}`)
  //client.end()
})