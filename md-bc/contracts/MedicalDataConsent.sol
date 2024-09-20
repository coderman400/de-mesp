// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalDataConsent {
    struct MedicalRecord {
        string dataHash; // IPFS/Filecoin hash of the medical data
        address patient; // Owner (patient) of the data
    }

    struct Consent {
        address requester;  // Researcher requesting access
        bool isApproved;    // Whether consent is granted
    }

    // Mapping from patient address to their medical records
    mapping(address => MedicalRecord) public medicalRecords;

    // Mapping from patient address to researcher address to consent status
    mapping(address => mapping(address => Consent)) public consents;

    // Events
    event DataAdded(address indexed patient, string dataHash);
    event ConsentGiven(address indexed patient, address indexed requester);
    event ConsentRevoked(address indexed patient, address indexed requester);

    // Patients can add their medical data (IPFS/Filecoin hash or encrypted data)
    function addMedicalRecord(string memory dataHash) public {
        medicalRecords[msg.sender] = MedicalRecord(dataHash, msg.sender);
        emit DataAdded(msg.sender, dataHash);
    }

    // Researchers can request access to a patient's data
    function requestAccess(address patient) public {
        require(medicalRecords[patient].patient != address(0), "Patient does not exist");
        consents[patient][msg.sender] = Consent(msg.sender, false);
    }

    // Patients can give consent to researchers for access
    function giveConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        consents[msg.sender][requester].isApproved = true;
        emit ConsentGiven(msg.sender, requester);
    }

    // Patients can revoke consent for data access
    function revokeConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        consents[msg.sender][requester].isApproved = false;
        emit ConsentRevoked(msg.sender, requester);
    }

    // Researchers can check if they have access to patient data
    function hasConsent(address patient) public view returns (bool) {
        return consents[patient][msg.sender].isApproved;
    }
}
