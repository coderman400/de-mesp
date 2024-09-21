// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MedicalDataConsent
 * @dev Manages medical data access between patients and researchers.
 */
contract MedicalDataConsent {
    struct MedicalRecord {
        string dataHash; // IPFS hash of the medical data
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

    // Events for frontend notifications
    event DataAdded(address indexed patient, string dataHash);
    event ConsentGiven(address indexed patient, address indexed requester);
    event ConsentRevoked(address indexed patient, address indexed requester);
    event AccessRequested(address indexed researcher, address indexed patient);

    /**
     * @dev Patients can add their medical data by providing the IPFS hash.
     * @param dataHash The IPFS hash of the medical data.
     */
    function addMedicalRecord(string memory dataHash) public {
        medicalRecords[msg.sender] = MedicalRecord(dataHash, msg.sender);
        emit DataAdded(msg.sender, dataHash);
    }

    /**
     * @dev Researchers can request access to a patient's medical data.
     * @param patient The Ethereum address of the patient.
     */
    function requestAccess(address patient) public {
        require(medicalRecords[patient].patient != address(0), "Patient does not exist");
        consents[patient][msg.sender] = Consent(msg.sender, false);
        emit AccessRequested(msg.sender, patient);
    }

    /**
     * @dev Patients can grant consent to a researcher to access their medical data.
     * @param requester The Ethereum address of the researcher.
     */
    function giveConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        require(consents[msg.sender][requester].requester == requester, "No access request found");
        consents[msg.sender][requester].isApproved = true;
        emit ConsentGiven(msg.sender, requester);
    }

    /**
     * @dev Patients can revoke consent from a researcher.
     * @param requester The Ethereum address of the researcher.
     */
    function revokeConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        require(consents[msg.sender][requester].requester == requester, "No access request found");
        consents[msg.sender][requester].isApproved = false;
        emit ConsentRevoked(msg.sender, requester);
    }

    /**
     * @dev Researchers can check if they have consent to access a patient's data.
     * @param patient The Ethereum address of the patient.
     * @return bool indicating if consent is granted.
     */
    function hasConsent(address patient) public view returns (bool) {
        return consents[patient][msg.sender].isApproved;
    }
}
