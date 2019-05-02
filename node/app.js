
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/cu.usbmodem146101', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));
const http = require('http');
let lastIntervalData = ['temp'];
let uploading = false; 
var receivedData = [];
// Read the port data
port.on("open", () => {
  // CHECK TO SEE IF ARDUINO HAS DONE UNLOADING DATA
  const uploadingInterval = setInterval(function(){ 
    if(uploading && receivedData.length !== lastIntervalData.length){      
      lastIntervalData = receivedData.slice(0); 
    } else if (uploading) {
      clearInterval(uploadingInterval); // stop the interval
      sendData(receivedData);
    }
  }, 500); // unloading data    
});
  
function sendData(arr){
  if(arr.length > 0 ){
    http.get('http://api.pushingbox.com/pushingbox?devid=vF46564D15CF4777&status=' + arr[0], (resp) => {
      console.log('sent to google form:', arr[0]);
      arr.shift();
      sendData(arr);
    });
  }
  else{
    console.log('we done');
  }
}

parser.on('data', data =>{
  uploading = true;
  receivedData.push(data);
});