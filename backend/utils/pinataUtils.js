const { PinataSDK } = require("pinata-web3")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

async function ipfsUpload(filename,data){
  try {
    const blob = new Blob([data]);
    const file = new File([blob], `${filename}.txt`, { type: "text/plain" })
    const upload = await pinata.upload.file(file);
    return upload.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

async function download(cid) {
  const file = await pinata.gateways.get(cid)
  return file
}


module.exports = { ipfsUpload,download };
