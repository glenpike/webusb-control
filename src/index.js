// const Tone = require('tone')

// window.Tone = Tone

import USBDevices from './usb-devices'


const usbDevices = new USBDevices();

const vendorId = 0x0D28
const productId = 0x0204
let running = false

async function delay(ms) { new Promise(resolve => setTimeout(resolve, ms) ) }

async function readUSBDevice() {
  const device = await usbDevices.addDevice([
    {vendorId, productId},
  ]);

  if(!device) {
    console.log('No device!')
    return;
  }
  console.log('Starting!')
  running = true

  let partialPacket = ''

  while(running) {
    const buffer = await usbDevices.readSerial(device)
    /*
      Actual
      � "t":18986637,"s":1509189866,"n":"pitch"v":-16
      V�5�8�+���?) 

      Expected
      {"t":1320874,"s":1509189866,"n":"pitch","v":5}
    */
    let decoder = new TextDecoder();
    let text = decoder.decode(buffer)
    if (!text.length) {
      continue
    }
    let endPacket = text.indexOf('}')
    let startPacket = text.indexOf('{')
    // Packets are split by newlines!
    // if endPacket
      // if startPacket is < endPacket
        // it's a whole packet - grab it (maybe more!)
      // if partialPacket.length
        // stick them together, set partialPacket to '', flag new packet.
      // check for more packets / partials
    
    // else if startPacket
      // if partialPacket is empty, chuck it in there
    // else if partialPacket.length, append it.
    // else maybe error!
    
    // need to do this in a loop - while (start && end && length)
    // https://github.com/microsoft/pxt/blob/4362bc4b848d62900af49e9025df743342e47f1b/webapp/src/serial.tsx#L253
    if (endPacket != -1) {
      if (startPacket != -1 && startPacket < endPacket) {
        packet = text.substring(startPacket, endPacket);
        console.log('Received packet: ', packet, endPacket, startPacket, text)
        if(partialPacket.length) {
          console.log('wait, partialPacket has some text in too! ', partialPacket)
        }
        // need to check for more packets / partials
      } else if(partialPacket.length) {
        packet = partialPacket + text.substring(0, endPacket)
        console.log('Combined partial and end: ', packet, partialPacket, endPacket, text)
        partialPacket = ''
        // check for start of next packet
      }
    } else if (startPacket != -1) {
      if (!partialPacket.length) {
        partialPacket = text;
      } else {
        console.warn('start of a packet, but partial not empty! ', text, partialPacket)
      }
    } else if (partialPacket.length) {
      partialPacket += text
    } else {
      console.warn('what happened?? ', text, partialPacket)
    }


    // console.log('Received: ', text, endPacket, startPacket)
    await delay(1000)
  }
  console.log('Stopping!')
}

(async () => {
  const go = document.querySelector('.js-button-go')
  console.log('button ', go)
  go.onclick = () => readUSBDevice()
  const stop = document.querySelector('.js-button-stop')
  stop.onclick = () => { running = false }
  
})()


// const listDevices = function() {
  
//   const filters = [
//     {vendorId, productId},
//   ];
//   console.log('go ', filters)
  
//   navigator.usb.getDevices(filters)
//   .then(devices => {
//     console.log("Total devices: " + devices.length);
//     devices.forEach(device => {
//       console.log("Product name: " + device.productName + ", serial number " + device.serialNumber);
//     });
//   });
// }

// let device

// const receivePacketAsync = () => {
//   let final = (res) => {
//     if (res.status != "ok")
//         this.error("USB IN transfer failed")
//     let arr = new Uint8Array(res.data.buffer)
//     if (arr.length == 0)
//         return recvPacketAsync()
//     return arr
//   }
//   return device.controlTransferIn({
//     requestType: "class",
//     recipient: "interface",
//     request: 0x01,
//     value: 0x100,
//     index: 4
//   }, 64).then(final)
// }

// const requestDevice = function() {
  

//   navigator.usb.requestDevice({ filters: [{ vendorId }] })
//     .then(selectedDevice => {
//       console.log('selectedDevice: ', selectedDevice)
//       device = selectedDevice;
//       return device.open(); // Begin a session.
//     })
//     .then(() => device.selectConfiguration(1))
//     .then(() => device.claimInterface(4)) // Request exclusive control over interface #4.
//     .then(() => receivePacketAsync())
//     .then(buf => {
//       let decoder = new TextDecoder();
//       console.log('Received: ' + decoder.decode(buf));
//     })
      
//     .catch(error => { console.log(error); });
// }


// const button = document.querySelector('.js-button')
// console.log('button ', button)
// button.onclick = requestDevice
