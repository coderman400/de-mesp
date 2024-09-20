const MedicalDataConsent = artifacts.require("MedicalDataConsent");

module.exports = function(deployer) {
  deployer.deploy(MedicalDataConsent);
};
